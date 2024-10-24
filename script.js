const apiKey = 'ba49b0ebd03dd496854f2123d3bf0407';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const feelsLikeElement = document.getElementById('feels-like');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const uvIndexElement = document.getElementById('uv-index');
const loadingSpinner = document.getElementById('loadingSpinner');
const p = document.getElementById('p1');
const chatbotButton = document.getElementById('chatbotButton');
const chatbotInterface = document.getElementById('chatbotInterface');
// Function to show/hide loading spinner
function toggleLoading(show) {
    // @ts-ignore
    loadingSpinner.style.display = show ? 'block' : 'none';
}

// Debounce Function for Input
let timeout = null;
// @ts-ignore
locationInput.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        resetToDefault();
    }, 500);
});

// Event listener for form submission
// @ts-ignore
document.getElementById('weatherForm').addEventListener('submit', event => {
    event.preventDefault();
    // @ts-ignore
    const location = locationInput.value;
    if (location) {
        fetchWeatherByCity(location);
    }
});

// Ask for user's location when the page loads
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            // @ts-ignore
            error => {
                // @ts-ignore
                p.textContent = "Location access denied. Please enter a city manually.";
            }
        );
    } else {
        // @ts-ignore
        p.textContent = "Geolocation is not supported by this browser.";
    }
};

// Function to fetch weather by city name
function fetchWeatherByCity(location) {
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`;
    fetchWeather(url);
}

// Function to fetch weather by coordinates
function fetchWeatherByCoords(lat, lon) {
    const url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetchWeather(url);
}

// Function to fetch weather data and update UI
function fetchWeather(url) {
    // @ts-ignore
    p.textContent = ""; // Clear previous messages
    toggleLoading(true); // Show loading spinner

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data not available.');
            }
            return response.json();
        })
        .then(data => {
            if (data.cod === '404') {
                // @ts-ignore
                p.textContent = "City not found. Please enter a valid city name.";
                toggleLoading(false);
                return;
            }

            const weather = data.weather[0].main.toLowerCase();

            // @ts-ignore
            locationElement.textContent = data.name;
            // @ts-ignore
            temperatureElement.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
            // @ts-ignore
            descriptionElement.textContent = `Condition: ${data.weather[0].description}`;
            // @ts-ignore
            humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
            // @ts-ignore
            windElement.textContent = `Wind Speed: ${data.wind.speed} m/s`;
            // @ts-ignore
            feelsLikeElement.textContent = `Feels Like: ${Math.round(data.main.feels_like)}°C`;
            // @ts-ignore
            pressureElement.textContent = `Pressure: ${data.main.pressure} hPa`;
            // @ts-ignore
            visibilityElement.textContent = `Visibility: ${data.visibility / 1000} km`;
            // @ts-ignore
            sunriseElement.textContent = `Sunrise: ${formatTime(data.sys.sunrise)}`;
            // @ts-ignore
            sunsetElement.textContent = `Sunset: ${formatTime(data.sys.sunset)}`;

            // Fetch UV index from a secondary API
            fetchUVIndex(data.coord.lat, data.coord.lon);

            // Update background image based on weather
            updateBackgroundImage(weather);

            toggleLoading(false); // Hide loading spinner
        })
        // @ts-ignore
        .catch(error => {
            // @ts-ignore
            p.textContent = "Please check your location or try again later.";
            toggleLoading(false); // Hide loading spinner
        });
}

// Function to fetch UV index
function fetchUVIndex(lat, lon) {
    const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(uvUrl)
        .then(response => response.json())
        .then(data => {
            // @ts-ignore
            uvIndexElement.textContent = `UV Index: ${data.value}`;
        })
        .catch(error => {
            console.error('Error fetching UV index:', error);
            // @ts-ignore
            uvIndexElement.textContent = 'UV Index: N/A';
        });
}

// Toggle the chatbot interface when the button is clicked
chatbotButton.addEventListener('click', () => {
    if (chatbotInterface.style.display === 'none' || chatbotInterface.style.display === '') {
        chatbotInterface.style.display = 'block';
    } else {
        chatbotInterface.style.display = 'none';
    }
});
// Function to format Unix timestamp to human-readable time
function formatTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Function to update background image based on weather
function updateBackgroundImage(weather) {
    switch (weather) {
        case 'clear':
            document.body.style.backgroundImage = "url('clear.jpg')";
            break;
        case 'clouds':
            document.body.style.backgroundImage = "url('clouds.jpg')";
            break;
        case 'rain':
            document.body.style.backgroundImage = "url('rain.jpg')";
            break;
        case 'snow':
            document.body.style.backgroundImage = "url('snow.jpg')";
            break;
        case 'thunderstorm':
            document.body.style.backgroundImage = "url('thunderstorm.jpg')";
            break;
        case 'fog':
        case 'mist':
        case 'haze':
            document.body.style.backgroundImage = "url('fog.jpg')";
            break;
        default:
            document.body.style.backgroundImage = "url('default.jpg')";
            break;
    }
}

// Reset to default when the input is edited
function resetToDefault() {
    // @ts-ignore
    locationElement.textContent = '';
    // @ts-ignore
    temperatureElement.textContent = '';
    // @ts-ignore
    descriptionElement.textContent = '';
    // @ts-ignore
    humidityElement.textContent = '';
    // @ts-ignore
    windElement.textContent = '';
    // @ts-ignore
    feelsLikeElement.textContent = '';
    // @ts-ignore
    pressureElement.textContent = '';
    // @ts-ignore
    visibilityElement.textContent = '';
    // @ts-ignore
    sunriseElement.textContent = '';
    // @ts-ignore
    sunsetElement.textContent = '';
    // @ts-ignore
    uvIndexElement.textContent = '';
    // @ts-ignore
    p.textContent = '';
    document.body.style.backgroundImage = "url('default.jpg')";
}
