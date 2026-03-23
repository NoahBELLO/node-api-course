const livreRepository = require("../repositories/livreRepository");

class LivreService {
  async findAll(filters = {}) {
    const where = {};
    if (filters.genre) where.genre = filters.genre;
    if (filters.disponible !== undefined)
      where.disponible = filters.disponible === "true";

    return livreRepository.findAll(where);
  }

  async findById(id) {
    const livre = await livreRepository.findById(parseInt(id));
    if (!livre) {
      const err = new Error("Livre introuvable");
      err.status = 404;
      throw err;
    }
    return livre;
  }

  async create(data) {
    return livreRepository.create(data);
  }

  async update(id, data) {
    await this.findById(id);
    return livreRepository.update(parseInt(id), data);
  }

  async delete(id) {
    await this.findById(id);
    await livreRepository.delete(parseInt(id));
  }

  async emprunter(livreId, userId) {
    const livre = await this.findById(livreId);

    if (!livre.disponible) {
      const err = new Error("Ce livre n'est pas disponible");
      err.status = 409;
      throw err;
    }

    return livreRepository.emprunter(parseInt(livreId), parseInt(userId));
  }

  async retourner(livreId, userId) {
    const emprunt = await livreRepository.findEmpruntActif(
      parseInt(livreId),
      parseInt(userId)
    );

    if (!emprunt) {
      const err = new Error("Aucun emprunt actif trouvé pour ce livre");
      err.status = 404;
      throw err;
    }

    return livreRepository.retourner(emprunt.id, parseInt(livreId));
  }
}

module.exports = new LivreService();
