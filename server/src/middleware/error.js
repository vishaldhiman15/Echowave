export const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status);
  res.json({
    message: err.message || "Server error",
  });
};
