const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const refreshTokenRepository = require("../repositories/refreshTokenRepository");
const { generateToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt");

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

class AuthService {
  async register(data) {
    const { nom, email, password } = data;

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const err = new Error("Cet email est déjà utilisé");
      err.status = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ nom, email, password: hashedPassword });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    await refreshTokenRepository.create(
      refreshToken,
      user.id,
      new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    );

    return { user, token, refreshToken };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error("Email ou mot de passe incorrect");
      err.status = 401;
      throw err;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const err = new Error("Email ou mot de passe incorrect");
      err.status = 401;
      throw err;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    await refreshTokenRepository.create(
      refreshToken,
      user.id,
      new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    );

    return {
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
      token,
      refreshToken,
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      const err = new Error("Refresh token manquant");
      err.status = 401;
      throw err;
    }

    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      const err = new Error("Refresh token invalide ou expiré");
      err.status = 401;
      throw err;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      const err = new Error("Refresh token invalide ou expiré");
      err.status = 401;
      throw err;
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      const err = new Error("Utilisateur introuvable");
      err.status = 401;
      throw err;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    return { token: generateToken(payload) };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      await refreshTokenRepository.deleteByToken(refreshToken);
    }
  }

  async getMe(userId) {
    return userRepository.findById(userId);
  }
}

module.exports = new AuthService();
