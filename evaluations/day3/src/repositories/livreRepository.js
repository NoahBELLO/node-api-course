const prisma = require("../db/prisma");

class LivreRepository {
  async findAll(where = {}) {
    return prisma.livre.findMany({ where, orderBy: { titre: "asc" } });
  }

  async findById(id) {
    return prisma.livre.findUnique({
      where: { id },
      include: {
        emprunts: {
          where: { dateRetour: null },
          include: { user: { select: { nom: true, email: true } } },
        },
      },
    });
  }

  async create(data) {
    const { titre, auteur, annee, genre, disponible } = data;
    return prisma.livre.create({ data: { titre, auteur, annee, genre, disponible } });
  }

  async update(id, data) {
    const { titre, auteur, annee, genre, disponible } = data;
    return prisma.livre.update({ where: { id }, data: { titre, auteur, annee, genre, disponible } });
  }

  async delete(id) {
    await prisma.$transaction(async (tx) => {
      await tx.emprunt.deleteMany({ where: { livreId: id } });
      await tx.livre.delete({ where: { id } });
    });
  }

  async updateDisponibilite(id, disponible) {
    return prisma.livre.update({ where: { id }, data: { disponible } });
  }

  async findEmpruntActif(livreId, userId) {
    return prisma.emprunt.findFirst({
      where: { livreId, userId, dateRetour: null },
    });
  }

  async emprunter(livreId, userId) {
    return prisma.$transaction(async (tx) => {
      await tx.livre.update({
        where: { id: livreId },
        data: { disponible: false },
      });
      return tx.emprunt.create({
        data: { livreId, userId },
        include: { livre: true, user: { select: { nom: true, email: true } } },
      });
    });
  }

  async retourner(empruntId, livreId) {
    return prisma.$transaction(async (tx) => {
      await tx.livre.update({
        where: { id: livreId },
        data: { disponible: true },
      });
      return tx.emprunt.update({
        where: { id: empruntId },
        data: { dateRetour: new Date() },
        include: { livre: true, user: { select: { nom: true, email: true } } },
      });
    });
  }
}

module.exports = new LivreRepository();
