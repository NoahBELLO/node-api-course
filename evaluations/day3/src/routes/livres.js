/**
 * @swagger
 * /api/livres:
 *   get:
 *     summary: Récupérer tous les livres
 *     tags: [Livres]
 *     parameters:
 *       - in: query
 *         name: disponible
 *         schema:
 *           type: boolean
 *         description: Filtrer par disponibilité
 *     responses:
 *       200:
 *         description: Liste des livres
 *   post:
 *     summary: Créer un livre
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, auteur]
 *             properties:
 *               titre:
 *                 type: string
 *               auteur:
 *                 type: string
 *               disponible:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Livre créé
 *       401:
 *         description: Non authentifié
 *
 * /api/livres/{id}:
 *   get:
 *     summary: Récupérer un livre par son ID
 *     tags: [Livres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail du livre
 *       404:
 *         description: Livre introuvable
 *   put:
 *     summary: Modifier un livre
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               auteur:
 *                 type: string
 *               disponible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Livre modifié
 *       401:
 *         description: Non authentifié
 *   delete:
 *     summary: Supprimer un livre (admin uniquement)
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Droits insuffisants
 *
 * /api/livres/{id}/emprunter:
 *   post:
 *     summary: Emprunter un livre
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Emprunt créé avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Livre introuvable
 *
 * /api/livres/{id}/retourner:
 *   post:
 *     summary: Retourner un livre emprunté
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retour enregistré avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Emprunt introuvable
 *
 * /api/livres/{id}/disponibilite:
 *   patch:
 *     summary: Modifier la disponibilité d'un livre
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [disponible]
 *             properties:
 *               disponible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Disponibilité mise à jour
 *       400:
 *         description: Champ disponible manquant ou invalide
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Livre introuvable
 */

const express = require("express");
const router = express.Router();
const controller = require("../controllers/livresController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
  livreCreateSchema,
  livreUpdateSchema,
} = require("../validators/livreValidator");

router.get("/", controller.index);
router.get("/:id", controller.show);
router.post("/", authenticate, validate(livreCreateSchema), controller.create);
router.put(
  "/:id",
  authenticate,
  validate(livreUpdateSchema),
  controller.update,
);
router.delete("/:id", authenticate, authorize("admin"), controller.destroy);
router.post("/:id/emprunter", authenticate, controller.emprunter);
router.post("/:id/retourner", authenticate, controller.retourner);
router.patch(
  "/:id/disponibilite",
  authenticate,
  controller.updateDisponibilite,
);

module.exports = router;
