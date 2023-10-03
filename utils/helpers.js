const _ = require("lodash");
const fs = require("fs");
const moment = require("moment/moment");
const { Types } = require("mongoose");
const { Expo } = require('expo-server-sdk');
const getValidationErrrJson = (err) => {
  const validationErrors = {};
  let status = 500;
  if (err.errors) {
    status = 400;
    // Mongo db validation
    const _errors = {};
    for (field in err.errors) {
      _errors[err.errors[field].path] = err.errors[field].message;
    }
    validationErrors.errors = _errors;
  } else if (err.details) {
    status = 400;
    // Joi validation
    // console.log(err.details);
    const _errors = {};
    for (const e of err.details) {
      _errors[e.path[0]] = `${_errors[e.path[0]] ? _errors[e.path[0]] + ", " : ""
        }${e.message}`;
    }
    validationErrors.errors = _errors;
  } else if (err.status) {
    status = err.status;
    validationErrors.detail = err.message;
  } else {
    status = 404;
    validationErrors.detail = err.message;
  }
  return { error: validationErrors, status };
};

const base64Encode = (data) => {
  const dataToEncode = JSON.stringify(data);
  const encoded = Buffer.from(dataToEncode, "utf8").toString("base64");
  return encoded;
};
const base64Decode = (encoded) => {
  const dataToEncode = JSON.stringify(encoded);
  const decoded = Buffer.from(dataToEncode, "base64").toString("utf-8");
  return decoded;
};

const pickX = (obj, paths, defaultValue = null) =>
  _.transform(
    paths,
    (result, path) => {
      const value = _.get(obj, path);
      _.set(result, path, value !== undefined ? value : defaultValue);
    },
    {}
  );

const deleteUploadedFile = (filePath) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      console.log("Error deleting file:", error);
    } else {
      console.log("File deleted successfully:", filePath);
    }
  });
};

const deleteUploadedFileAsync = async (filePath) => {
  const { promisify } = require("util");
  const unlinkPromise = promisify(fs.unlink);

  try {
    await unlinkPromise(filePath);
    console.log("File deleted successfully:", filePath);
    return true;
  } catch (error) {
    console.log("Error deleting file:", error);
    return false;
  }
};

const deleteUploadedFileAsyncMannual = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        console.log("Error deleting file:", error);
        reject(false);
      } else {
        console.log("File deleted successfully:", filePath);
        resolve(true);
      }
    });
  });
};

const getUpdateFileAsync = async (req, dst, currImage) => {
  /**{
      fieldname: 'image',
      originalname: '1692383725664-ontransit.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: 'E:\\DawaDrop\\dawa-drop-express/media/menu-icons/',
      filename: '1692520360223-1692383725664-ontransit.png',
      path: 'E:\\DawaDrop\\dawa-drop-express\\media\\menu-icons\\1692520360223-1692383725664-ontransit.png',
      size: 47705
} */
  // used in multipart form data updates to check if file is same as previous
  //returns file to save on db or undefined
  if (req.file) {
    const originalImage = `/${dst}${req.file.originalname}`;
    // if file is not updated then return original else return new
    if (originalImage === currImage) {
      // Delete new upload and return the old
      await deleteUploadedFileAsyncMannual(req.file.path);
      return originalImage;
    }
    // In future you can delete old
    return `/${dst}${req.file.filename}`;
  }
};

const constructFilter = (
  query,
  filterFields = [],
  skipParse = [],
  operator = "$and"
) => {
  const q = parseQueryValues(query, skipParse);
  const f = filterFields
    .filter((key) => q[key])
    .map((key) => ({ [key]: q[key] }));
  return {
    $match: f.length > 0 ? { [operator]: f } : {},
  };
};

const constructSearch = (searchValue, searchFields = [], skipParse = []) => {
  const query = searchFields.reduce(
    (accumulated, current) => ({
      ...accumulated,
      [current]: searchValue,
    }),
    {}
  );
  return constructFilter(query, searchFields, skipParse, "$or");
};

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date) && date instanceof Date && !isNaN(date.getTime());
}
function parseQueryValues(query, skip = []) {
  const parsedQuery = {};

  for (const key in query) {
    const value = query[key];
    if (value === "true" || value === "false") {
      if (skip.includes(key)) parsedQuery[key] = value;
      else parsedQuery[key] = value === "true";
    } else if (!isNaN(value)) {
      if (skip.includes(key)) parsedQuery[key] = value;
      else parsedQuery[key] = parseFloat(value);
    } else if (Types.ObjectId.isValid(value)) {
      if (skip.includes(key)) parsedQuery[key] = value;
      else parsedQuery[key] = new Types.ObjectId(value);
    } else {
      parsedQuery[key] = value;
    }
  }

  return parsedQuery;
}

function generateRandomNumberInRange(min, max) {
  if (min >= max) {
    throw new Error("Invalid range: Minimum must be less than maximum.");
  }

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber;
}

function generateRandomNumber() {
  const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
  return randomNumber.toString();
}

const cleanFalsyAttributes = (obj) => {
  return _.pickBy(obj, (value) => !!value || value === false);
};

function generateOTP(length = 5) {
  var string = "0123456789";
  let OTP = "";
  var len = string.length;
  for (let i = 0; i < length; i++) {
    OTP += string[Math.floor(Math.random() * len)];
  }
  return OTP;
}
function generateExpiryTime(minutes = 5) {
  return moment().add(minutes, "minute");
}

function parseMessage(object, template) {
  // regular expression to match placeholders like {{field}}
  const placeholderRegex = /{{(.*?)}}/g;

  // Use a replace function to replace placeholders with corresponding values
  const parsedMessage = template.replace(
    placeholderRegex,
    (match, fieldName) => {
      // The fieldName variable contains the field name inside the placeholder
      // Check if the field exists in the event object
      if (object.hasOwnProperty(fieldName)) {
        return object[fieldName]; // Replace with the field's value
      } else {
        // Placeholder not found in event, leave it unchanged
        return match;
      }
    }
  );

  return parsedMessage;
}

const sendPushNotifiation = async (pushNotificationTokens = [], message, payLoad = {}) => {


  // Create a new Expo SDK client
  // optionally providing an access token if you have enabled push security
  let expo = new Expo(
    // { accessToken: process.env.EXPO_ACCESS_TOKEN }
  );

  // Create the messages that you want to send to clients
  let messages = [];
  for (let pushToken of pushNotificationTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: 'default',
      body: message,
      data: payLoad,
    })
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();


  // Later, after the Expo push notification service has delivered the
  // notifications to Apple or Google (usually quickly, but allow the the service
  // up to 30 minutes when under load), a "receipt" for each notification is
  // created. The receipts will be available for at least a day; stale receipts
  // are deleted.
  //
  // The ID of each receipt is sent back in the response "ticket" for each
  // notification. In summary, sending a notification produces a ticket, which
  // contains a receipt ID you later use to get the receipt.
  //
  // The receipts may contain error codes to which you must respond. In
  // particular, Apple or Google may block apps that continue to send
  // notifications to devices that have blocked notifications or have uninstalled
  // your app. Expo does not control this policy and sends back the feedback from
  // Apple and Google so you can handle it appropriately.
  let receiptIds = [];
  for (let ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();


}

module.exports.parseMessage = parseMessage;
module.exports.generateOTP = generateOTP;
module.exports.generateExpiryTime = generateExpiryTime;
module.exports.getValidationErrrJson = getValidationErrrJson;
module.exports.base64Encode = base64Encode;
module.exports.base64Decode = base64Decode;
module.exports.pickX = pickX;
module.exports.deleteUploadedFileAsyncMannual = deleteUploadedFileAsyncMannual;
module.exports.isValidDate = isValidDate;
module.exports.parseQueryValues = parseQueryValues;
module.exports.parseQueryValues = parseQueryValues;
module.exports.constructFilter = constructFilter;
module.exports.constructSearch = constructSearch;
module.exports.cleanFalsyAttributes = cleanFalsyAttributes;
module.exports.getUpdateFileAsync = getUpdateFileAsync;
module.exports.generateRandomNumberInRange = generateRandomNumberInRange;
module.exports.generateRandomNumber = generateRandomNumber;
