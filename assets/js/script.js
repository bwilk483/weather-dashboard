//global variables
var config = {
  API_KEY: "aa5b0499596508166f54f492f60a0144",
};
var key = config.API_KEY;
var weatherIconEl = document.querySelector("#weather-icon");
var searchFormEl = document.querySelector("#search-form");
var searchInputEl = document.querySelector("#city-search");
var currentHeadingEl = document.querySelector("#current-heading");
var currentDataEl = document.querySelector("#current-data");
var currentIconEl = document.querySelector("#current-icon");
var clearButtonEl = document.querySelector("#clear-btn");
var searchContainerEl = document.querySelector("#search-container");
var errorContainerEl = document.querySelector("#error-container");
var temp = document.querySelector("#temp");
var wind = document.querySelector("#wind");
var humid = document.querySelector("#humid");
var uvi = document.querySelector("#uvi");
var search = JSON.parse(localStorage.getItem("search") || "[]");

//when a city is searched for send the city name to getcords
var formSubmitHandler = function (event) {
  event.preventDefault();
  var cityName = searchInputEl.value.trim();
  searchInputEl.value = "";
  //make sure something was entered
  if (cityName) {
    getCords(cityName);
    errorContainerEl.innerHTML = "";
  } else {
    errorContainerEl.innerHTML = "Please enter a city name!";
    return;
  }
};

//turn city name into lat and lon
var getCords = function (cityName) {
  var apiUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    cityName +
    "&limit=1&appid=" +
    key;
  fetch(apiUrl)
    .then(function (res) {
      errorContainerEl.innerHTML = "";
      return res.json();
    })
    .then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;
      getWeather(lat, lon);
    })
    //if city name is not valid
    .catch(function (error) {
      errorContainerEl.innerHTML = "Please enter a valid city name!";
      return;
    });
};

//take coordinates and send them to OpenWeather
var getWeather = function (lat, lon) {
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=imperial&appid=" +
    key;
  fetch(apiUrl)
    .then(function (res) {
      if (res.ok) {
        return res.json();
      } else {
        alert("Please enter a valid city coordinate!");
      }
    })
    .then(function (data) {
      displayWeather(data);
      displayForecast(data);
    });
};

//display the current weather in the top div
var displayWeather = function (data) {
  var apiUrl =
    "https://api.openweathermap.org/geo/1.0/reverse?lat=" +
    data.lat +
    "&lon=" +
    data.lon +
    "&limit=1&appid=" +
    key;
  var iconLink =
    "https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png";
  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      currentHeadingEl.innerHTML =
        data[0].name + " (" + moment().format("M/D/YYYY") + ") ";
      currentIconEl.innerHTML = "<img src=" + iconLink + ">";
      saveSearch(data[0].name);
    });
  //weather data variables
  temp.textContent = "Temp: " + data.current.temp + " \u00B0F";
  wind.textContent = "Wind: " + data.current.wind_speed + " MPH";
  humid.textContent = "Humidity: " + data.current.humidity + " %";

  if (data.current.uvi < 2) {
    uvi.innerHTML =
      "UV Index: " + "<span class='uvi-low'>" + data.current.uvi + "</span>";
  } else if (data.current.uvi < 5) {
    uvi.innerHTML =
      "UV Index: " + "<span class='uvi-mid'>" + data.current.uvi + "</span>";
  } else if (data.current.uvi < 7) {
    uvi.innerHTML =
      "UV Index: " + "<span class='uvi-high'>" + data.current.uvi + "</span>";
  } else {
    uvi.innerHTML =
      "UV Index: " + "<span class='uvi-vhigh'>" + data.current.uvi + "</span>";
  }
};

//display the 5 day forecast
var displayForecast = function (data) {
  //add date
  for (i = 1; i < 6; i++) {
    var current = document.querySelector("#card" + i + "-title");
    current.textContent = moment().add(i, "d").format("M/D/YYYY");
  }

  //add weather data
  for (j = 0; j < 5; j++) {
    var currentData = data.daily[j];
    var iconLink =
      "https://openweathermap.org/img/w/" +
      currentData.weather[0].icon +
      ".png";
    var icon = document.querySelector("#card" + j + "-icon");
    icon.src = iconLink;
    var temp = document.querySelector("#card" + j + "-temp");
    temp.innerHTML = "Temp: " + currentData.temp.day + " \u00B0F";
    var wind = document.querySelector("#card" + j + "-wind");
    wind.innerHTML = "Wind: " + currentData.wind_speed + " MPH";
    var humid = document.querySelector("#card" + j + "-humid");
    humid.innerHTML = "Humidity: " + currentData.humidity + " %";
  }
};

//save search history
var saveSearch = function (cityName) {
  if (search.includes(cityName)) {
    return;
  } else {
    search.push(cityName);
    localStorage.setItem("search", JSON.stringify(search));
    loadSearch();
  }
};

//load search history when page loads
var loadSearch = function () {
  if (search.length > 0) {
    searchContainerEl.innerHTML = "";
    for (i = 0; i < search.length; i++) {
      var searchBtn = document.createElement("div");
      searchBtn.className = "search-btn w-100 m-0 mb-2";
      searchBtn.textContent = search[i];
      searchContainerEl.appendChild(searchBtn);
    }
  } else {
    searchContainerEl.innerHTML = "";
  }
};

var clearHistory = function () {
  search = [];
  localStorage.clear();
  loadSearch();
};

//search for location that is clicked on in history
var reSearch = function (event) {
  if (event.target.innerHTML.includes("<")) {
    return;
  } else {
    getCords(event.target.innerHTML);
  }
};

loadSearch();
searchFormEl.addEventListener("submit", formSubmitHandler);
clearButtonEl.addEventListener("click", clearHistory);
searchContainerEl.addEventListener("click", reSearch);
