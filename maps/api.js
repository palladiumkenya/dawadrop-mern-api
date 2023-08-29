const dotenv = require("dotenv");
dotenv.config();
import("node-fetch")
  .then((fetchModule) => {
    // You can use fetchModule here
    const fetch = fetchModule.default; // Assuming 'node-fetch' exports a default object
    // Rest of your code using fetch
  })
  .catch((error) => {
    // Handle error if import fails
    console.error('Error importing "node-fetch":', error);
  });

const config = require("config");
const { pick } = require("lodash");

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
        street: res.properties.street,
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

const openRouteMatrix = async ({
  profile = "driving-car",
  src: { lat: srcLat, lng: srcLng },
  dst: { lat: dstLat, lng: dstLng },
}) => {
  const url = `${config.get("openroute")}v2/matrix/${profile}`;
  const myHeaders = new Headers();
  myHeaders.append("Authorization", config.get("openstreat_api"));
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    locations: [
      [srcLat, srcLng],
      [dstLat, dstLng],
    ],
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  const response = await fetch(url, requestOptions);
  if (response.status === 200) {
    return await response.json();
  }
};

const mapQuestMatrix = async ({
  profile = "driving-car",
  src: { lat: srcLat, lng: srcLng },
  dst: { lat: dstLat, lng: dstLng },
}) => {
  // DONE AND WORKS GREATE
  const url = `${config.get(
    "mapquest"
  )}directions/v2/routematrix?key=${config.get("mapquest_key")}`;

  const raw = JSON.stringify({
    locations: [`${srcLat},${srcLng}`, `${dstLat},${dstLng}`],
  });
  const requestOptions = {
    method: "POST",
    body: raw,
    redirect: "follow",
  };
  const response = await fetch(url, requestOptions);
  if (response.status === 200) {
    const data = await response.json();
    if (data.info.statuscode === 0) {
      return {
        time: data.time,
        distance: data.distance,
        locations: data.locations.map((loc) => ({
          display: loc.adminArea6,
          coordinates: loc.latLng,
          name: loc.adminArea6,
          properties: {
            countryCode: loc.adminArea1,
            county: loc.adminArea4,
            street: loc.street,
            city: loc.adminArea5,
            type: loc.type,
          },
        })),
      };
    }
  }
};

const mapQuestOptimizedRoute = async ({
  profile = "driving-car",
  src: { lat: srcLat, lng: srcLng },
  dst: { lat: dstLat, lng: dstLng },
}) => {
  const url = `${config.get(
    "mapquest"
  )}directions/v2/optimizedroute?key=${config.get("mapquest_key")}`;

  const raw = JSON.stringify({
    locations: [`${srcLat},${srcLng}`, `${dstLat},${dstLng}`],
  });

  const requestOptions = {
    method: "POST",
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(url, requestOptions);
  if (response.status === 200) {
    const data = await response.json();
    const route = data.route;
    return {
      route: {
        ...pick(route, [
          "distance",
          "time",
          "legs",
          "legs",
          "locations",
          "options",
        ]),
        locations: route.locations.map((loc) => ({
          display: loc.adminArea6,
          coordinates: loc.latLng,
          name: loc.adminArea6,
          properties: {
            countryCode: loc.adminArea1,
            county: loc.adminArea4,
            street: loc.street,
            city: loc.adminArea5,
            type: loc.type,
          },
        })),
        legs: route.legs.map((leg) => ({
          ...pick(leg, ["distance", "time", "maneuvers"]),
          maneuvers: leg.maneuvers.map((maneuver) => ({
            ...pick(maneuver, [
              "index",
              "distance",
              "narrative",
              "time",
              "direction",
              "directionName",
              "signs",
              "maneuverNotes",
              "transportMode",
              "startPoint",
              "turnType",
              "attributes",
              "iconUrl",
              "streets",
            ]),
          })),
        })),
      },
    };
  }
};

module.exports = {
  mapQuestPlacesSearch,
  openRoutePlaceSearch,
  mapQuestReverseGeoCode,
  openRouteReverseGeocode,
  openRouteMatrix,
  mapQuestMatrix,
  mapQuestOptimizedRoute,
};
