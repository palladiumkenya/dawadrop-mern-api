const dotenv = require("dotenv");
dotenv.config();
const config = require("config");
const axios = require("axios");
const { pick } = require("lodash");

const mapQuestPlacesSearch = async (search) => {
  const url = `${config.get("mapquest")}search/v3/prediction?key=${config.get(
    "mapquest_key"
  )}&limit=15&collection=adminArea,poi,address,category,franchise,airport&q=${search}`;
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const data = response.data;
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
  } catch (error) {
    console.error("Error fetching MapQuest Places:", error);
  }
};

const openRoutePlaceSearch = async (search) => {
  const url = `${config.get(
    "openroute"
  )}geocode/autocomplete?api_key=${config.get(
    "openstreat_api"
  )}&text=${search}`;
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const data = response.data;
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
  } catch (error) {
    console.error("Error fetching OpenRoute Places:", error);
  }
};

const mapQuestReverseGeoCode = async ({ lat, lng }) => {
  const url = `${config.get("mapquest")}geocoding/v1/reverse?key=${config.get(
    "mapquest_key"
  )}&location=${lat},${lng}&includeRoadMetadata=true&includeNearestIntersection=true`;
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const data = response.data;
      return data.results.map((res) => ({
        providedLocation: {
          ...res.providedLocation.latLng,
        },
        locations: res.locations,
      }));
    }
  } catch (error) {
    console.error("Error fetching MapQuest Reverse GeoCode:", error);
  }
};

const openRouteReverseGeocode = async ({ lat, lng }) => {
  const url = `${config.get("openroute")}geocode/reverse?api_key=${config.get(
    "openstreat_api"
  )}&point.lon=${lng}&point.lat=${lat}`;
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const data = response.data;
      return data.features.map((res) => ({
        providedLocation: {
          lat: res.geometry.coordinates[1],
          lng: res.geometry.coordinates[0],
        },
        locations: [res.properties],
      }));
    }
  } catch (error) {
    console.error("Error fetching OpenRoute Reverse Geocode:", error);
  }
};

const openRouteMatrix = async ({
  profile = "driving-car",
  src: { lat: srcLat, lng: srcLng },
  dst: { lat: dstLat, lng: dstLng },
}) => {
  const url = `${config.get("openroute")}v2/matrix/${profile}`;
  const raw = JSON.stringify({
    locations: [
      [srcLat, srcLng],
      [dstLat, dstLng],
    ],
  });

  const headers = {
    Authorization: config.get("openstreat_api"),
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, raw, { headers });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching OpenRoute Matrix:", error);
  }
};

const mapQuestMatrix = async ({
  profile = "driving-car",
  src: { lat: srcLat, lng: srcLng },
  dst: { lat: dstLat, lng: dstLng },
}) => {
  const url = `${config.get(
    "mapquest"
  )}directions/v2/routematrix?key=${config.get("mapquest_key")}`;

  const raw = JSON.stringify({
    locations: [`${srcLat},${srcLng}`, `${dstLat},${dstLng}`],
  });

  try {
    const response = await axios.post(url, raw);
    if (response.status === 200) {
      const data = response.data;
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
  } catch (error) {
    console.error("Error fetching MapQuest Matrix:", error);
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

  try {
    const response = await axios.post(url, raw);
    if (response.status === 200) {
      const data = response.data;
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
  } catch (error) {
    console.error("Error fetching MapQuest Optimized Route:", error);
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
