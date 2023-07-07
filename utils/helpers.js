const getValidationErrrJson = (err) => {
  const validationErrors = {};
  if (err.errors) {
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
    // Joi validation
    const _errors = err.details.map((error) => ({
      field: error.path[0],
      message: error.message,
    }));
    validationErrors.errors = _errors;
  } else {
    validationErrors.detail = err.message;
  }
  return validationErrors;
};

module.exports.getValidationErrrJson = getValidationErrrJson;
