exports.sendResponse = (res, statusCode, message, data) => {
  const response = {
    status: statusCode,
    message,
  };

  // Only include `data` if it's not undefined
  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};
