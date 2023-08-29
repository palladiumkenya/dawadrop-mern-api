const _ = require("lodash");
const fs = require("fs");
const { Types } = require("mongoose");
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
      _errors[e.path[0]] = `${
        _errors[e.path[0]] ? _errors[e.path[0]] + ", " : ""
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
