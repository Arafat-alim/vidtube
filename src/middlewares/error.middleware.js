import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // Default to 500 if statusCode is not defined
  console.log(err);
  let statusCode = err?.statusCode || 500;
  let message = err?.message || "Internal Server Error";

  // If the error is not an instance of our custom ApiError,
  // it might be an unexpected server error.
  if (!(err instanceof ApiError)) {
    // In development, you might want to log the full error
    if (process.env.NODE_ENV === "development") {
      console.error(err);
    }

    // For production, send a generic message to avoid leaking implementation details
    if (process.env.NODE_ENV === "production") {
      statusCode = 500;
      message = "Internal Server Error";
    }
  }

  const response = {
    success: false,
    statusCode,
    message,
    errors: err?.errors || [],
    // Include stack trace only in development mode
    stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
  };

  return res.status(statusCode).json(response);
};

export { errorHandler };
