const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeather = document.querySelector(".current-weather");
const weatherCard = document.querySelector(".weather-card");
const chatbotButton = document.getElementById('chatbotButton');
const chatbotInterface = document.getElementById('chatbotInterface');
const apiKey = "ba49b0ebd03dd496854f2123d3bf0407";


// Displaying Weather Data
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <h4>Temprature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind : ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity : ${weatherItem.main.humidity}%</h4>
    </div>

    <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather img">
        <h4>${weatherItem.weather[0].description}</h4>
    </div>`
    } else {
        return `<li class="card">
        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather img">
        <h4>Temprature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind : ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity : ${weatherItem.main.humidity}%</h4>
    </li>`;
    }
}
// Toggle the chatbot interface when the button is clicked
chatbotButton.addEventListener('click', () => {
    if (chatbotInterface.style.display === 'none' || chatbotInterface.style.display === '') {
        chatbotInterface.style.display = 'block';
    } else {
        chatbotInterface.style.display = 'none';
    }
});
// Fetching Weather Data using Entered City
const getWeatherDetails = (cityName, lat, lon) => {
    const weather_url = http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}

    fetch(weather_url).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        currentWeather.innerHTML = "";
        weatherCard.innerHTML = "";
        cityInput.value = "";

        console.log(fiveDaysForecast);
        fiveDaysForecast.forEach((weatherItem,index) => {
            if (index === 0) {
                currentWeather.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            } else {
                weatherCard.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        })
    }).catch(() => {
        alert("something went wrong while fetching the weather");
    })
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const api_url = http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey};

    fetch(api_url).then(res => res.json()).then(data => {
        if (!data.length) return alert("No City Found");
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("an error occured while feching data");
    })
}
// Fetching Weather data using User's Location (Current Location)
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey};
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}


searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());