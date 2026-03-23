const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const { generateToken } = require("../utils/jwt");

const SALT_ROUNDS = 12;

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

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
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

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
      token,
    };
  }

  async getMe(userId) {
    return userRepository.findById(userId);
  }
}

module.exports = new AuthService();
