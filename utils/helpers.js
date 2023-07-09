const getValidationErrrJson = (err) => {
  const validationErrors = {};
  let status = 500;
  if (err.errors) {
    status = 400;
    // Mongo db validation
    const _errors = [];
    for (field in err.errors) {
      _errors.push({
        field: err.errors[field].path,
        message: err.errors[field].message,
      });
    }
    validationErrors.errors = _errors;
  } else if (err.details) {
    status = 400;
    // Joi validation
    const _errors = err.details.map((error) => ({
      field: error.path[0],
      message: error.message,
    }));
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

module.exports.getValidationErrrJson = getValidationErrrJson;
module.exports.base64Encode = base64Encode;
module.exports.base64Decode = base64Decode;
