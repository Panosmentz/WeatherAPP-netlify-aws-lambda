window.addEventListener("load", () => {
  //Declare latitude and longitude

  let lat;
  let lng;

  //Selectors Main

  const temperatureDescription = document.querySelector(
    ".temperature-description"
  );
  const temperatureDegree = document.querySelector(".temperature-degree");
  const locationTimezone = document.querySelector(".location-timezone");
  const apparentTemperature = document.querySelector(".apparent-temperature");
  const precipChance = document.querySelector(".precipitation-chance");

  //Selectors Hourly

  const hourlyTime = document.querySelectorAll(".time");
  const hourlyTemperature = document.querySelectorAll(".hourly-temperature");
  const hourlyIcon = document.querySelectorAll(".hourly-icon");
  const hourlyDesc = document.querySelectorAll(".hourly-summary");

  //Arrays to store data from the API

  const formattedTime = new Array(12);
  const tempTemperature = new Array(12);
  const tempIcons = new Array(12);
  const tempDesc = new Array(12);
  const precipSum = new Array(12);

  //If allowed geolocation

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lng = position.coords.longitude;

      //bypass localhost error
      const fetchWeather = async () =>
        await (
          await fetch(`/.netlify/functions/getweather?lat=${lat}&lng=${lng}`)
        ).json();

      fetchWeather().then((data) => {
        console.log(data);
        // Parse data from the API to variables(main section)
        const { temperature, summary, icon } = data.currently;

        //Set DOM Elements from the API

        temperatureDegree.textContent = Math.floor(temperature);
        temperatureDescription.textContent = summary;
        locationTimezone.textContent = data.timezone;
        apparentTemperature.textContent =
          "Feels like " + Math.floor(data.currently.apparentTemperature) + "°C";

        //Hourly section

        //Parse data from the API to variables(hourly section)

        function populateNextHours() {
          for (let i = 1; i < 13; i++) {
            //Unix conversion
            let unix_timestamp = data.hourly.data[i].time;
            let date = new Date(unix_timestamp * 1000);
            let hours = date.getHours();
            let minutes = "0" + date.getMinutes();
            formattedTime[i - 1] = hours + ":" + minutes.substr(-2);
            //End of unix conversion

            //Parse data from the API to Arrays
            tempTemperature[i - 1] = data.hourly.data[i].temperature;
            tempIcons[i - 1] = data.hourly.data[i].icon;
            tempDesc[i - 1] = data.hourly.data[i].summary;
            precipSum[i - 1] = data.hourly.data[i].precipProbability;
          }
        }
        //Call the function to populate the Arrays
        populateNextHours();

        //Calculate the Chance of Precipitation
        const avg =
          (precipSum.reduce((a, b) => a + b) / precipSum.length) * 100;
        precipChance.textContent =
          Math.floor(avg) +
          "% " +
          "Chance of Precipitation in the upcoming hours";

        //Set DOM elements(hourly section)
        for (let i = 1; i < 13; ++i) {
          hourlyTime[i - 1].textContent = formattedTime[i - 1];
          hourlyTemperature[i - 1].textContent =
            Math.floor(tempTemperature[i - 1]) + "°C";
          hourlyDesc[i - 1].textContent = tempDesc[i - 1];

          //Set Icons(hourly section)

          setHourlyIcons(tempIcons[i - 1], hourlyIcon[i - 1]);
        }

        //Set Icon(main section)
        setIcons(icon, document.querySelector(".icon"));
      });
    });
  }

  //Initialize Skycons(main section)

  function setIcons(icon, iconID) {
    const skycons = new Skycons({ color: "white" });
    const currentIcon = icon.replace(/-/g, "_").toUpperCase();
    skycons.play();
    return skycons.set(iconID, Skycons[currentIcon]);
  }

  //Initialize Skycons(hourly section)

  function setHourlyIcons(tempIcons, iconID) {
    const skycons = new Skycons({ color: "white" });
    const currentIcon = tempIcons.replace(/-/g, "_").toUpperCase();
    skycons.play();
    return skycons.set(iconID, Skycons[currentIcon]);
  }
});
