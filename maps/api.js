// const dotenv = require("dotenv");

// dotenv.config();

const config = require("config");

const mapQuestPlacesSearch = async (search) => {
  const url = `${config.get("mapquest")}search/v3/prediction?key=${config.get(
    "mapquest_key"
  )}&limit=15&collection=adminArea,poi,address,category,franchise,airport&q=${search}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const data = await response.json();
    return data.results
      .filter((res) => res.place)
      .map((res) => ({
        display: res.displayString,
        coordinates: {
          lat: res.place.geometry.coordinates[0],
          lng: res.place.geometry.coordinates[1],
        },
        name: res.name,
        properties: res.place.properties,
      }));
  }
};

const openRoutePlaceSearch = async (search) => {
  const url = `${config.get(
    "openroute"
  )}geocode/autocomplete?api_key=${config.get(
    "openstreat_api"
  )}&text=${search}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const data = await response.json();
    return data.features.map((res) => ({
      display: res.properties.label,
      coordinates: {
        lat: res.geometry.coordinates[0],
        lng: res.geometry.coordinates[1],
      },
      name: res.properties.name,
      properties: {
        country: res.properties.country,
        countryCode: res.properties.country_a,
        county: res.properties.county,
        city: null,
        type: null,
      },
    }));
  }
  console.log(await response.json());
};

module.exports = {
  mapQuestPlacesSearch,
  openRoutePlaceSearch,
};
