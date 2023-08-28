const dotenv = require("dotenv");
dotenv.config();
const config = require("config");
const https = require("https");
const path = require("path");
const fs = require("fs");
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

const searchPatient = async (upi) => {
  try {
    const filePath = path.join(__dirname, "./patients.json");
    const jsonData = await fs.promises.readFile(filePath, "utf8");
    const transformedData = JSON.parse(jsonData);
    return transformedData
      .map(({ message }) => message)
      .find(({ clinic_number }) => clinic_number === upi);
  } catch (error) {
    console.error("Error fetching Reports fact ART:", error);
  }
  // const response = await fetch(
  //   `${config.get("ushauri")}mohupi/search_ccc?client_id=${upi}`,
  //   {
  //     method: "GET",
  //   }
  // );
  // if (response.status === 200) {
  //   const data = await response.json();
  //   if (data.success) {
  //     return data.message;
  //   }
  // }
  return null;
};

const sendOtp = async (otp, phone, create = true) => {
  const message = `Dear Dawa-Drop User, Your OTP ${
    create ? "to complete profile" : "for password reset"
  } is ${otp}. Valid for the next 24 hours.`;
  const url = config.get("sms_url");
  const apiKey = config.get("sms_api_key");
  const shortCode = config.get("short_code");
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("api-token", apiKey);
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    destination: phone,
    msg: message,
    sender_id: phone,
    gateway: shortCode,
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    // redirect: "follow",
    // mode: "cors",
    // credentials: "omit",
  };
  await fetch(url, requestOptions);
};
const sendSms = async (message, phone) => {
  const url = config.get("sms_url");
  const apiKey = config.get("sms_api_key");
  const shortCode = config.get("short_code");
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("api-token", apiKey);
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    destination: phone,
    msg: message,
    sender_id: phone,
    gateway: shortCode,
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    // redirect: "follow",
    // mode: "cors",
    // credentials: "omit",
  };
  await fetch(url, requestOptions);
};

const getRegimen = async (cccNumber) => {
  const url = `http://prod.kenyahmis.org:8002/api/patient/${cccNumber}/regimen`;
  // return "ABC + GPT + LOP";

  const response = await fetch(url, { method: "GET" });
  if (response.status === 200) {
    const data = await response.json();
    if (data["status"] === "success") {
      return data.message;
    }
  }
  return null;
};

module.exports = {
  searchPatient,
  sendOtp,
  getRegimen,
  sendSms,
};
