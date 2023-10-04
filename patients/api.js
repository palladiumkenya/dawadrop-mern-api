const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const config = require("config");
const https = require("https");
const path = require("path");
const fs = require("fs");

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
  // const url = `${config.get("ushauri")}mohupi/search_ccc?client_id=${upi}`;
  // try {
  //   const response = await axios.get(url);

  //   if (response.status === 200) {
  //     const data = response.data;
  //     if (data.success) {
  //       return data.message;
  //     }
  //   }
  // } catch (error) {
  //   console.error("Error searching patient:", error);
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

  const headers = {
    Accept: "application/json",
    "api-token": apiKey,
    "Content-Type": "application/json",
  };

  const data = {
    destination: phone,
    msg: message,
    sender_id: phone,
    gateway: shortCode,
  };

  try {
    const response = await axios.post(url, data, { headers });

    if (response.status === 200) {
      const responseBody = response.data;
      if (responseBody.success) {
        return responseBody.message;
      }
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
  }

  return null;
};

const sendSms = async (message, phone) => {
  const url = config.get("sms_url");
  const apiKey = config.get("sms_api_key");
  const shortCode = config.get("short_code");

  const headers = {
    Accept: "application/json",
    "api-token": apiKey,
    "Content-Type": "application/json",
  };

  const data = {
    destination: phone,
    msg: message,
    sender_id: phone,
    gateway: shortCode,
  };

  try {
    await axios.post(url, data, { headers });
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

const getRegimen = async (cccNumber) => {
  const url = `http://prod.kenyahmis.org:8002/api/patient/${cccNumber}/regimen`;

  try {
    const response = await axios.get(url);

    if (response.status === 200) {
      const data = response.data;
      if (data["status"] === "success") {
        return data.message;
      }
    }
  } catch (error) {
    console.error("Error getting regimen:", error);
  }

  return null;
};

module.exports = {
  searchPatient,
  sendOtp,
  getRegimen,
  sendSms,
};
