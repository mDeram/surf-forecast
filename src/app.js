require('dotenv').config();
const express = require('express');
const app = express();
const port = 4000;
const path = require('path');
const fs = require('fs');
const homepage = process.env.HOMEPAGE || '';
const domain = process.env.DOMAIN || 'localhost';

let url;
if (domain == 'localhost')
    url = `http://${domain}:${port}/${homepage}`;
else
    url = `http://${domain}/${homepage}`;

app.use('/' + homepage, express.static('src/img'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const DatabaseMap = require('./interfaces/map_reader.js');
const databaseMap = new DatabaseMap();
databaseMap.loadMapData();

const forecastFormat = require('./interfaces/forecast.js');
let pageGet = 0;
let apiGet = 0;

app.get('/' + homepage, (req, res) => {
    res.render('previsions', {
        url,
        apiUrl: url + '/api',
        spots: databaseMap.db
    });
    pageGet++;
    console.log('page: ' + pageGet);
});

app.get('/' + homepage + '/api', (req, res) => {
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
