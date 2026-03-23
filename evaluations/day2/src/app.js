const express = require('express');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const authRouter = require('./routes/auth');
const livresRouter = require('./routes/livres');

const app = express();
app.use(express.json());
app.use(logger);

app.use('/api/auth', authRouter);
app.use('/api/livres', livresRouter);

app.use(errorHandler);

module.exports = app;
