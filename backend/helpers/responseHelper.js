export const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const responsePayload = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) responsePayload.data = data;
  if (meta !== null) responsePayload.meta = meta;

  return res.status(statusCode).json(responsePayload);
};

export const sendError = (res, statusCode, message, errors = null) => {
  const responsePayload = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors !== null) responsePayload.errors = errors;

  return res.status(statusCode).json(responsePayload);
};
