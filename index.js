require('dotenv').config()

const {
    inquirerMenu,
    readInput, 
    pause,
    listPlaces
} = require('./helpers/inquirer');
const Searches = require('./models/searches');

console.log(process.env.MAPBOX_KEY);

const main = async ()=>{

    let opt = 1;

    const searches = new Searches()

    do{
        opt = await inquirerMenu();
        
        switch (opt) {

            case 1: 
                //show message
                const placeSearch = await readInput('City: ');
                //search the places
                const places = await searches.city(placeSearch);
                //select the place
                console.log();
                const id = await listPlaces(places);
                if(id === '0') continue;

                const placeSelected = places.find( (p) => p.id === id);

                //Save in DB
                searches.saveHistoric(placeSelected.name)

                //weather
                const weather = await searches.weatherPlace(placeSelected.lat,placeSelected.lon)
                //Show results
                console.clear();
                console.log('\nInformation of the city\n'.green);
                console.log('City:',placeSelected.name.green);
                console.log('Lat:',placeSelected.lat);
                console.log('Lon:',placeSelected.lon);
                console.log('Temperature:', weather.temp);
                console.log('Fells like:', weather.feels_like);
                console.log('Temp. Max:', weather.temp_max);
                console.log('Temp. Min:', weather.temp_min);
                console.log('How is the weather:', weather.description.green);

            break;

            case 2:
                console.log();
                //searches._historic
                
                searches.historicCapitalize.forEach((place, i)=>{
                    index = `${i + 1}.`.green;
                    console.log(`${index} ${place}`);
                })
            break;
        
        }

        opt ? await pause() : console.clear()

    }while(opt !== 0)
    
}

main()