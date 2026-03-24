const prisma = require("../db/prisma");

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, nom: true, email: true, role: true, createdAt: true },
    });
  }

  async create(data) {
    return prisma.user.create({
      data,
      select: { id: true, nom: true, email: true, role: true, createdAt: true },
    });
  }
}

module.exports = new UserRepository();
