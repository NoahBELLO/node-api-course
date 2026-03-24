function errorHandler(err, req, res, next) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    status: err.status || 500,
    message: err.message,
  };

  if (process.env.NODE_ENV === "development") {
    return res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
    });
  }

  const status = err.status || 500;

  if (status >= 500) {
    console.error("[ERROR]", JSON.stringify(logEntry));
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }

  res.status(status).json({ error: err.message });
}

function notFound(req, res) {
  res
    .status(404)
    .json({ error: `Route introuvable : ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFound };
