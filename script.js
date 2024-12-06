// script.js

// Select DOM elements
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const locationDiv = document.getElementById('location-name');

// Initialize the map
const map = L.map('map').setView([20, 0], 2); // Centered at [20, 0], zoom level 2

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker;

// Function to handle map clicks
function onMapClick(e) {
    const latitude = e.latlng.lat;
    const longitude = e.latlng.lng;

    // Remove existing marker
    if (marker) {
        map.removeLayer(marker);
    }

    // Add new marker at clicked location
    marker = L.marker([latitude, longitude]).addTo(map);

    // Fetch and display weather data for the selected location
    getWeatherData(latitude, longitude);
}

// Attach click event to the map
map.on('click', onMapClick);


function getWeatherData(latitude, longitude) {
    // Display loading message or icon
    locationDiv.innerHTML = `<p>Loading location name...</p> <div class="loader"></div>`;

    // Fetch current weather data
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data.current_weather);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
        });

    // Fetch 7-day weather forecast data
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`)
        .then(response => response.json())
        .then(data => {
            displayForecast(data.daily);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });

    // Fetch location name
    getLocationName(latitude, longitude);
}


// script.js

function getLocationName(latitude, longitude) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            displayLocationName(data);
        })
        .catch(error => {
            console.error('Error fetching location name:', error);
        });
}

function displayLocationName(data) {
    const name = data.display_name || 'Unknown location';
    locationDiv.innerHTML = `<h2>${name}</h2>`;
}

// Function to display current weather
function displayCurrentWeather(current) {
    const html = `
        <div class="weather-section">
            <h2>Current Weather</h2>
            <div class="weather-item">
                <span>Temperature:</span>
                <span>${current.temperature} °C</span>
            </div>
            <div class="weather-item">
                <span>Wind Speed:</span>
                <span>${current.windspeed} km/h</span>
            </div>
            <div class="weather-item">
                <span>Wind Direction:</span>
                <span>${current.winddirection}°</span>
            </div>
        </div>
    `;
    currentWeatherDiv.innerHTML = html;
}

// Function to display weather forecast
function displayForecast(daily) {
    let html = `
        <div class="weather-section">
            <h2>7-Day Forecast</h2>
    `;

    const weatherCodeDescriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Drizzle: Light intensity",
        53: "Drizzle: Moderate intensity",
        55: "Drizzle: Dense intensity",
        56: "Freezing Drizzle: Light intensity",
        57: "Freezing Drizzle: Dense intensity",
        61: "Rain: Slight intensity",
        63: "Rain: Moderate intensity",
        65: "Rain: Heavy intensity",
        66: "Freezing Rain: Light intensity",
        67: "Freezing Rain: Heavy intensity",
        71: "Snow fall: Slight intensity",
        73: "Snow fall: Moderate intensity",
        75: "Snow fall: Heavy intensity",
        77: "Snow grains",
        80: "Rain showers: Slight",
        81: "Rain showers: Moderate",
        82: "Rain showers: Violent",
        85: "Snow showers: Slight",
        86: "Snow showers: Heavy",
        95: "Thunderstorm: Slight or moderate",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };

    for (let i = 0; i < daily.time.length; i++) {
        const date = daily.time[i];
        const tempMax = daily.temperature_2m_max[i];
        const tempMin = daily.temperature_2m_min[i];
        const weatherCode = daily.weathercode[i];
        const description = weatherCodeDescriptions[weatherCode] || "Unknown";

        html += `
            <div class="weather-item">
                <span>${date}</span>
                <span>${description}, High: ${tempMax} °C, Low: ${tempMin} °C</span>
            </div>
        `;
    }

    html += `</div>`;
    forecastDiv.innerHTML = html;
}
