const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const authRouter = require("./routes/auth");
const livresRouter = require("./routes/livres");

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
const optionCors = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS : origine non autorisée — ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  message: { error: "Trop de requêtes, réessayez dans 15 minutes" },
});

const app = express();
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(cors());
}

if (process.env.NODE_ENV === "production") {
  app.use(cors(optionCors));
}

app.use(globalLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use("/api/auth", authRouter);
app.use("/api/livres", livresRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
