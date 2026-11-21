const sampleWeather = {
    meerut: {
        city: "Meerut",
        temp: 29,
        feels: 31,
        humidity: 58,
        wind: 12,
        rain: 10,
        condition: "Sunny",
        icon: "☀️",
        high: 32,
        low: 24
    },

    delhi: {
        city: "Delhi",
        temp: 30,
        feels: 32,
        humidity: 45,
        wind: 10,
        rain: 5,
        condition: "Clear Sky",
        icon: "☀️",
        high: 33,
        low: 25
    },

    mumbai: {
        city: "Mumbai",
        temp: 28,
        feels: 32,
        humidity: 76,
        wind: 16,
        rain: 25,
        condition: "Cloudy",
        icon: "⛅",
        high: 30,
        low: 26
    }
};


const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");


document.getElementById("todayDate").textContent =
    new Date().toDateString();



function showWeather(data) {

    document.getElementById("cityName").textContent =
        data.city + ", IN";

    document.getElementById("temperature").textContent =
        Math.round(data.temp) + "°";

    document.getElementById("weatherIcon").textContent =
        data.icon;

    document.getElementById("condition").textContent =
        data.condition;

    document.getElementById("feelsLike").textContent =
        data.feels + "°C";

    document.getElementById("humidity").textContent =
        data.humidity;

    document.getElementById("wind").textContent =
        data.wind;

    document.getElementById("rain").textContent =
        data.rain;

    document.getElementById("feelsCard").textContent =
        data.feels;

    document.getElementById("highLow").textContent =
        "H: " + data.high + "° L: " + data.low + "°";


    // Display weather tip
    if (data.temp >= 30) {

        document.getElementById("tipTitle").textContent =
            "Stay Cool and Hydrated";

        document.getElementById("tipText").textContent =
            "It is a warm day. Drink enough water and stay in the shade.";

    } else {

        document.getElementById("tipTitle").textContent =
            "Enjoy Your Day";

        document.getElementById("tipText").textContent =
            "The weather looks comfortable. Have a wonderful day!";
    }

    makeForecast(data);
}


// Function to create 5-day forecast
function makeForecast(data) {

    const days = [
        "Today",
        "Tomorrow",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    const icons = [
        "☀️",
        "⛅",
        "🌤️",
        "🌧️",
        "☀️"
    ];

    const forecastList =
        document.getElementById("forecastList");

    forecastList.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const high = data.high + (i % 2);
        const low = data.low - (i % 2);

        const item = document.createElement("div");

        item.className = "forecast-item";

        item.innerHTML =
            `<span>${days[i]}</span>
             <span>${icons[i]}</span>
             <strong>${high}° / ${low}°</strong>`;

        forecastList.appendChild(item);
    }
}


function getCondition(code) {

    if (code === 0) {
        return ["Sunny", "☀️"];
    }

    if (code === 1 || code === 2) {
        return ["Partly Cloudy", "⛅"];
    }

    if (code === 3) {
        return ["Cloudy", "☁️"];
    }

    if (code >= 45 && code <= 48) {
        return ["Foggy", "🌫️"];
    }

    if (code >= 51 && code <= 67) {
        return ["Rainy", "🌧️"];
    }

    if (code >= 71 && code <= 77) {
        return ["Snowy", "❄️"];
    }

    if (code >= 95) {
        return ["Thunderstorm", "⛈️"];
    }

    return ["Partly Cloudy", "⛅"];
}


// Function to get live weather from API
async function getWeather(city) {

    message.textContent = "Searching for city...";

    try {

        // Get city location
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }

        const place = geoData.results[0];

        // Get weather information
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        const condition = getCondition(current.weather_code);

        const data = {

            city: place.name,

            temp: current.temperature_2m,

            feels: current.apparent_temperature,

            humidity: current.relative_humidity_2m,

            wind: current.wind_speed_10m,

            rain: daily.precipitation_probability_max[0] || 0,

            condition: condition[0],

            icon: condition[1],

            high: Math.round(daily.temperature_2m_max[0]),

            low: Math.round(daily.temperature_2m_min[0])
        };

        showWeather(data);

        // Replace forecast with API data
        const forecastList =
            document.getElementById("forecastList");

        forecastList.innerHTML = "";

        for (let i = 0; i < 5; i++) {

            const item = document.createElement("div");

            item.className = "forecast-item";

            const chance =
                daily.precipitation_probability_max[i] || 0;

            const icon =
                chance > 50 ? "🌧️" :
                chance > 20 ? "⛅" : "☀️";

            item.innerHTML =
                `<span>${i === 0 ? "Today" : "Day " + (i + 1)}</span>
                 <span>${icon}</span>
                 <strong>${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</strong>`;

            forecastList.appendChild(item);
        }

        message.textContent = "Live weather loaded successfully!";

    }

    catch (error) {

        const key = city.toLowerCase().trim();

        if (sampleWeather[key]) {

            showWeather(sampleWeather[key]);

            message.textContent =
                "Showing sample weather data for " + city;

        } else {

            message.textContent =
                "City not found. Please try again.";
        }
    }
}


// Search button functionality
searchBtn.addEventListener("click", function() {

    const city = cityInput.value.trim();

    if (city === "") {

        message.textContent =
            "Please enter a city name.";

        return;
    }

    getWeather(city);
});


// Search using Enter key
cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        searchBtn.click();
    }
});


// Display default weather
showWeather(sampleWeather.meerut);
