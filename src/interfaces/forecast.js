function preFormat(data) {
    return {                           
        wave: data[0].data,                          
        wind: data[1].data,        
        tides: data[2].data,
        weather: data[3].data
    }
}

function forecastFormat(data) {
    let forecast = preFormat(data);

    return forecast;
}

module.exports = forecastFormat;
