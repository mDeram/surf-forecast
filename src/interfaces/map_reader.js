const fs = require('fs');
const getJSON = require('get-json');

const Cache = require('./cache.js');
let cache;

function formatLink(id, name) {
    const spaceRule = / +/g;
    let formatedName = name.split(spaceRule).join('-'); 
    const dashRule = /-+/g;
    formatedName = formatedName.split(dashRule).join('-');
    return `https://www.surfline.com/surf-report/${formatedName}/${id}`;
}

class DatabaseMap {
    constructor() {
        this.db = [];
        cache = new Cache(this.fetchData.bind(this), 3600);
    }
    loadMapData() {
        fs.readFile('./src/map.json', 'utf8', (err, data) => {
            if (err) {
                console.log(`error reading map.json : ${err}`);
                return -1
            }
            this.db = [];

            const db = JSON.parse(data);

            const db2 = db.map.locationView.taxonomy.contains;
            db2.forEach(item => {
                if (item.type != 'spot') {
                    return;
                }

                this.db.push({
                    id: item.spot,
                    coords: item.location.coordinates,
                    name: item.name,
                    lowName: item.name.toLowerCase(),
                    link: formatLink(item.spot, item.name)
                });
            });
            this.db.sort((a, b) => a.lowName > b.lowName ? 1 : -1 );
        });
    } 
    getResults(query) {
        return getJSON(`https://services.surfline.com/kbyg/spots/forecasts/${query}`, (err, res) => {
            if (typeof(err) == String) {
                console.log(err);
                return -1;
            }

            return res;
        });
    }
    fetchData(id) {
        const subquery = `?spotId=${id}&days=1`;
        const results = [
            this.getResults('wave'+subquery),
            this.getResults('wind'+subquery),
            this.getResults('tides'+subquery),
            this.getResults('weather'+subquery)
        ]
        return Promise.all(results); 
    }
    getData(id) {
        return cache.retrieve(id);
    }
}

module.exports = DatabaseMap;
