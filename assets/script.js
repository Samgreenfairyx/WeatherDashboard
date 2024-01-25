// OpenWeatherMap API key
const apiKey = '166a433c57516f51dfab1f7edaed8413';

// DOM elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-city');
const historyList = document.getElementById('city-results');
const todaySection = document.getElementById('current-weather');
const forecastSection = document.getElementById('five-day-forecast');

// Event listener for form submission
searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const cityName = searchInput.value.trim();

  // Check if the input is not empty
  if (cityName !== '') {
    getWeatherData(cityName);
    searchInput.value = ''; // Clear the input field after submission
  }
});

// Event delegation for click events on history list
historyList.addEventListener('click', function (event) {
  if (event.target.matches('.list-group-item')) {
    const cityName = event.target.textContent;
    getWeatherData(cityName);
  }
});

// Function to fetch weather data from the API
async function getWeatherData(city) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    console.log('API URL:', apiUrl);

    // Make the API call
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    console.log('API Response:', data);

    // Process the retrieved data
    displayWeatherData(data);
    saveToLocalStorage(city);
    updateSearchHistory();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to display weather data on the page
function displayWeatherData(data) {
  // Clear previous data
  todaySection.innerHTML = '';
  forecastSection.innerHTML = '';

  // Display today's weather
  const today = data.list[0];
  if (!today) {
    console.error('Invalid data format. Could not retrieve today\'s weather.');
    return;
  }

  const todayDate = new Date(today.dt * 1000);
  const iconUrl = `https://openweathermap.org/img/w/${today.weather[0].icon}.png`;

  todaySection.innerHTML = `
    <div class="current-weather-info">
        <div>
            <h2>${data.city.name}</h2>
            <p class="large-date">${todayDate.toDateString()}</p>
            <p>Temperature: ${convertKelvinToCelsius(today.main.temp)} °C</p>
            <p>Humidity: ${today.main.humidity}%</p>
            <p>Wind: ${today.wind.speed} m/s</p>
        </div>
        <div>
            <img src="${iconUrl}" alt="Weather Icon">
        </div>
    </div>
`;

  // Display 5-day forecast
  for (let i = 1; i < data.list.length; i += 8) {
    const forecast = data.list[i];
    if (!forecast) {
      console.error('Invalid data format. Could not retrieve forecast data.');
      continue;
    }

    const forecastDate = new Date(forecast.dt * 1000);
    const forecastIconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;

    forecastSection.innerHTML += `
      <div class="weather-card">
        <p>Date: ${forecastDate.toDateString()}</p>
        <p>Temperature: ${convertKelvinToCelsius(forecast.main.temp)} °C</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
        <p>Wind: ${forecast.wind.speed} m/s</p>
        <img src="${forecastIconUrl}" alt="Weather Icon">
      </div>
    `;
  }
}

// Function to convert Kelvin to Celsius
function convertKelvinToCelsius(kelvin) {
  return (kelvin - 273.15).toFixed(2);
}

// Function to save searched cities to local storage
function saveToLocalStorage(city) {
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];

  // Avoid duplicate entries
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem('weatherHistory', JSON.stringify(history));
  }
}

// Function to load and display history from local storage
function updateSearchHistory() {
  const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  historyList.innerHTML = '';

  history.forEach((city) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.textContent = city;
    historyList.appendChild(listItem);
  });
}

// Event listener for clear history button click
document.getElementById('clear-storage').addEventListener('click', function () {
  // Clear search history from local storage
  localStorage.removeItem('weatherHistory');
  // Update the displayed search history
  updateSearchHistory();
});

// Initial load
updateSearchHistory();
