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

const constructFilter = (query, filterFields = [], operator = "$and") => {
  const q = parseQueryValues(query);
  const f = filterFields
    .filter((key) => q[key])
    .map((key) => ({ [key]: q[key] }));
  return {
    $match: f.length > 0 ? { [operator]: f } : {},
  };
};

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date) && date instanceof Date && !isNaN(date.getTime());
}
function parseQueryValues(query) {
  const parsedQuery = {};

  for (const key in query) {
    const value = query[key];
    if (value === "true" || value === "false") {
      parsedQuery[key] = value === "true";
    } else if (!isNaN(value)) {
      parsedQuery[key] = parseFloat(value);
    } else if (Types.ObjectId.isValid(value)) {
      parsedQuery[key] = new Types.ObjectId(value);
    } else {
      parsedQuery[key] = value;
    }
  }

  return parsedQuery;
}
module.exports.getValidationErrrJson = getValidationErrrJson;
module.exports.base64Encode = base64Encode;
module.exports.base64Decode = base64Decode;
module.exports.pickX = pickX;
module.exports.deleteUploadedFileAsyncMannual = deleteUploadedFileAsyncMannual;
module.exports.isValidDate = isValidDate;
module.exports.parseQueryValues = parseQueryValues;
module.exports.parseQueryValues = parseQueryValues;
module.exports.constructFilter = constructFilter;
