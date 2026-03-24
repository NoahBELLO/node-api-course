require('dotenv').config();
const app = require("./app");
const config = require('./config/env');

app.listen(config.port, () => {
  console.log(`Serveur démarré sur le port ${config.port} en mode ${config.nodeEnv}`);
});
