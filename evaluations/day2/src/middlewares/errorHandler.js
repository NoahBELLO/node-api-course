function errorHandler(err, req, res, next) {
  console.error("Erreur attrapée par le middleware d'erreurs :", err);
  const status = err.status || 500;
  res
    .status(status)
    .json({ success: false, error: err.message || "Erreur serveur" });
}

module.exports = errorHandler;
