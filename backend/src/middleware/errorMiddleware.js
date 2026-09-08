const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
};

const errorHandler = (error, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({ success: false, message: error.message || "Server Error" });
};

module.exports = { notFound, errorHandler };
