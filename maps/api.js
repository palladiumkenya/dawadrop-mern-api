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
          lat: res.place.geometry.coordinates[1],
          lng: res.place.geometry.coordinates[0],
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
        lat: res.geometry.coordinates[1],
        lng: res.geometry.coordinates[0],
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
};

const mapQuestReverseGeoCode = async ({ lat, lng }) => {
  const url = `${config.get("mapquest")}geocoding/v1/reverse?key=${config.get(
    "mapquest_key"
  )}&location=${lat},${lng}&includeRoadMetadata=true&includeNearestIntersection=true`;

  const response = await fetch(url);
  if (response.status === 200) {
    const data = await response.json();
    return data.results.map((res) => ({
      providedLocation: {
        ...res.providedLocation.latLng,
      },
      locations: res.locations,
    }));
  }
};

const openRouteReverseGeocode = async ({ lat, lng }) => {
  const url = `${config.get("openroute")}geocode/reverse?api_key=${config.get(
    "openstreat_api"
  )}&point.lon=${lng}&point.lat=${lat}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const data = await response.json();
    return data.features.map((res) => ({
      providedLocation: {
        lat: res.geometry.coordinates[1],
        lng: res.geometry.coordinates[0],
      },
      locations: [res.properties],
    }));
  }
};
module.exports = {
  mapQuestPlacesSearch,
  openRoutePlaceSearch,
  mapQuestReverseGeoCode,
  openRouteReverseGeocode,
};
