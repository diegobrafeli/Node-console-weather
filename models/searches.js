const fs = require('fs');

const axios = require('axios');
const { encode } = require('punycode');

class Searches {

    _historic = [];
    dbPath = './db/database.json'

    constructor (){
        //TODO: read DB if it is exists
        this.readDB();
    }

    get historicCapitalize(){
        //Capitalize the cities
        const historic = this._historic.map((place) =>{ 
            return place.toLowerCase().replace(/(?:^|\s)\S/g, (a)=> { return a.toUpperCase(); });
        })
        
        return historic
    }

    get paramsMapBox(){
        return {
                'proximity':  'ip',
                'language' : 'pt',
                'types': 'place',
                'limit' : 5,
                'access_token': process.env.MAPBOX_KEY
            } 
    }

    get paramsOpenWeather(){
        
        return {
                'appid': process.env.OPENWEATHER_KEY,
                'units' : 'metric',
                'lang': 'pt'
            }
        
    }

    async city(place = '') {

        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
                params: this.paramsMapBox
            })
            const resp = await instance.get();

            return resp.data.features.map((place) =>({
                id: place.id,
                name: place.place_name,
                lon: place.center[0],
                lat: place.center[1]
            }))

        } catch (error) {
            return []
        }
    }

    async weatherPlace(lat, lon){
        try {

            //instance of axios
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon}
            })

            this.lat = lat;
            this.lon = lon;
            const resp = await instance.get();
            const {description} = resp.data.weather[0];
            const {temp, feels_like, temp_min, temp_max } = resp.data.main;

            return {
                description,
                temp,
                temp_min,
                temp_max,
                feels_like
            }

        } catch (error) {
            console.log(error);
        }
    }

    saveHistoric(place = ''){
        //avoid duplicate
        if(this._historic.includes(place.toLocaleLowerCase())) return

        this._historic = this._historic.splice(0,5);

        this._historic.unshift(place.toLocaleLowerCase());

        //save em DB
        this.saveDB();
    }

    saveDB(){
        const payload = {
            historic : this._historic
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    readDB(){
        if(!fs.existsSync(this.dbPath)) return
        const info = fs.readFileSync(this.dbPath, {encoding:'utf-8'})
        const data = JSON.parse(info);
        this._historic = data.historic;
    }

}

module.exports = Searches;