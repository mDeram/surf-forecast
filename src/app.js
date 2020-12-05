const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');

const publicIp = require('public-ip');
let redirectIp = 'localhost';
publicIp.v4().then(value => {
    if (value != '78.114.95.54') {
        redirectIp = value;
    }
    redirectIp = 'http://'.concat(redirectIp);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const DatabaseMap = require('./interfaces/map_reader.js');
const databaseMap = new DatabaseMap();
databaseMap.loadMapData();

const forecastFormat = require('./interfaces/forecast.js');

const Cache = require('./interfaces/cache.js');
function retriever(id) {
    let ha = databaseMap.getData(id);
    console.log(ha);
    return ha;
}
const cache = new Cache(retriever, 3600);

app.get('/', (req, res) => {
    res.render('previsions', {
        ip: redirectIp,
        port: port,
        spots: databaseMap.db
    });
});

app.get('/api', (req, res) => {
    const id = req.query.id;
    if (id != undefined) {
        cache.retrieve(id).then(result => {
            res.json(forecastFormat(result));
        });
    }
});

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});
