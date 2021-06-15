const express = require('express');
const app = express();
const port = 4000;
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

app.use(express.static('src/img'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const DatabaseMap = require('./interfaces/map_reader.js');
const databaseMap = new DatabaseMap();
databaseMap.loadMapData();

const forecastFormat = require('./interfaces/forecast.js');
let pageGet = 0;
let apiGet = 0;

app.get('/', (req, res) => {
    res.render('previsions', {
        ip: redirectIp,
        port: port,
        spots: databaseMap.db
    });
    pageGet++;
    console.log('page: ' + pageGet);
});

app.get('/api', (req, res) => {
    const id = req.query.id;
    if (id != undefined) {
        databaseMap.getData(id).then(result => {
            res.json(forecastFormat(result));
        });
    }
    apiGet++;
    console.log('api: ' + apiGet);
});

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});
