const errorHandler = (err, req, res) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "internal server error",
  });
};

export default errorHandler;
