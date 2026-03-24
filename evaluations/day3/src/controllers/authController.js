const authService = require("../services/authService");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

class AuthController {
  async register(req, res, next) {
    try {
      const { user, token, refreshToken } = await authService.register(
        req.body,
      );
      res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token, refreshToken } = await authService.login(
        email,
        password,
      );
      res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.cookies.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.cookies.refreshToken);
      res.clearCookie("refreshToken");
      res.json({ message: "Déconnecté" });
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const user = await authService.getMe(req.user.userId);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
