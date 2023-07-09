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
    validationErrors.detail = err.message
  } else {
    status = 404;
    validationErrors.detail = err.message;
  }
  return { error: validationErrors, status };
};

module.exports.getValidationErrrJson = getValidationErrrJson;
