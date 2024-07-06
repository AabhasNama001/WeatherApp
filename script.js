const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// Variables needed initially

let oldTab = userTab;
let API_KEY = "8b3646b979e165eee7a68210d751fdd2";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    // agar tum ek tab se dusre tab pe jaana chaahte ho
    if (newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        // Now i wanna know that i am active at search tab or your weather tab ?
        if (!searchForm.classList.contains("active")) {
            // Kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            // Mai pehle search wale tab pr tha , ab your weather wale tab pr jaunga
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // Ab mai your weather wale tab p aa gya hu, toh weather bhi display krna pdega, so let's check 
            // local storage first for coordinates , if we have saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// Checks if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        // Agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        // JSON format m convert kr diya local coordinates ko
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    // Make grantAccessContainer invisible
    grantAccessContainer.classList.remove("active");
    // Make Loader visible
    loadingScreen.classList.add("active");

    // API Call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/3.0
        /onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // Now Render--> Data m se value nikaal ke UI pe display krega
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove("active");
    }
}

function renderWeatherInfo(weatherInfo) {
    // Firstly we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-desc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // Fetch values from weatherInfo objects and put in UI elements
    // For this I have called API and put lat, long & API key in that url
    // Then copy all the data and paste in any JSON formatter where we can see values of weatherInfo objects.
    // Here "?." is showing iske andar. e.g --> India?.Rajasthan?.Jaipur?.Sanganer;.
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

}

function getLocation() {
    // agar support available hai 
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        // H.W - show an alert for no geolocation support available
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,

    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    // Agar cityName empty hai toh return
    if (cityName === "")
        return;
    else
        fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=
                                      ${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {
        // HW
    }

}
