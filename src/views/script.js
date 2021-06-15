let redirectIp = '<%- ip %>:<%- port %>';
let spots = <%- JSON.stringify(spots) %>;

function filterSpots(searchString) {
    searchString = searchString.toLowerCase();
    const results = [];
    for (let spot of spots) {
        if (searchString == '' || spot.lowName.includes(searchString)) {
            results.push(spot.name);
        }
    }
    return results;
}

const searchBar = document.getElementById("spot-finder-input");

function select(spotName) {
    searchBar.value = spotName;
    const spot = spots.find(spot => spot.name == spotName);
    fetchPrevisions(spot);

    return false;
}

function updateSpots(spots) {
    const dropDown = document.getElementById("dropdown-list");
    let list = '';
    spots.forEach(spot => {
        list += `<button class="dropdown-item" onclick="return select('${spot}')">${spot}</button>`;
    });
    dropDown.innerHTML = list;
    return false
}

function fetchPrevisions(spot) {
    fetch(redirectIp+'/api?id='+spot.id)
        .then(res => {
            res.json().then(res => displayPrevisions(spot, res));
        }, err => {
            displayFetchError();
            setTimeout(() => {
                fetchPrevisions(spot);
            }, 5000);
        });
}

searchBar.addEventListener('keyup', search => {
    if (search.keyCode === 8 && search.target.value.length != 0) {
        return;
    }

    const searchString = search.target.value;
    filteredSearch = filterSpots(searchString);
    updateSpots(filteredSearch);
    if (filteredSearch.length == 1) {
        select(filteredSearch[0]);
    }
});

searchBar.addEventListener('focus', search => {
    if (search.target.value == '') {
        updateSpots(filterSpots(''));
    }
});

const weatherCtx = document.getElementById('weather').getContext('2d');
const windCtx = document.getElementById('wind').getContext('2d');
const tideCtx = document.getElementById('tide').getContext('2d');
const windArrow = document.getElementById('windArrow');

function displayFetchError() {
    console.log('error');
}

function displayPrevisions(spot, previsions) {
    console.log(spot);
    console.log(previsions);
    displayWind(previsions.wind.wind);
    displayWeather(previsions.weather.weather);
    displayTide(previsions.tides.tides);
}

function flush(arr) {
    while (arr.length) {
        arr.pop();
    }
}

function displayWeather(weather) {
    let weathers = []
    let times = []
    weather.forEach(data => {
        weathers.push(data.temperature);

        let date = new Date(data.timestamp * 1000);
        times.push(date.getHours() + 'h');
    });

    const data = weatherChart.data.datasets[0].data;
    const labels = weatherChart.data.labels;

    flush(data);
    data.push(...weathers);
    flush(labels);
    labels.push(...times);

    weatherChart.update();
}

function displayWind(wind) {
    let winds = [];
    let times = [];
    let rotations = [];
    wind.forEach(data => {
        winds.push(data.speed);
        rotations.push(90 + data.direction);

        let date = new Date(data.timestamp * 1000);
        times.push(date.getHours() + 'h');
    });

    const data = windChart.data.datasets[0].data;
    const labels = windChart.data.labels;
    const rotation = windChart.data.datasets[0].rotation;

    flush(data);
    data.push(...winds);
    flush(labels);
    labels.push(...times);
    flush(rotation);
    rotation.push(...rotations);

    windChart.update();
}

function displayTide(tide) {
    let tides = []
    let times = []
    for (let i = 0; i < tide.length; i++) {
        let data = tide[i];


        let date = new Date(data.timestamp * 1000);
        let hour = date.getHours() + 'h';
        if (i == 0 || (hour != times[times.length-1] && hour != '0h')) {
            times.push(hour);
            tides.push(data.height);
        }
    }

    const data = tideChart.data.datasets[0].data;
    const labels = tideChart.data.labels;

    flush(data);
    data.push(...tides);
    flush(labels);
    labels.push(...times);

    tideChart.update();
}

const weatherChart = new Chart(weatherCtx, {
    type: 'bar',
    data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        datasets: [{
            label: 'Temperature en C',
            data: [],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

const windChart = new Chart(windCtx, {
    type: 'line',
    data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        datasets: [{
            label: 'Vitesse du Vent en km/h',
            data: [],
            borderWidth: 1,
            rotation: [],
            pointStyle: windArrow
        }]
    }
});

const tideChart = new Chart(tideCtx, {
    type: 'line',
    data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        datasets: [{
            label: 'Marée en m',
            data: [],
            borderWidth: 1
        }]
    }
});
