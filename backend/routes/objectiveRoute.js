/**
 * @file objectiveRoutes.js
 * @description Routes Express pour les objectifs financiers.
 *
 * GET    /api/objectives        → Liste des objectifs
 * POST   /api/objectives        → Créer un objectif
 * GET    /api/objectives/:id    → Détail d'un objectif
 * PUT    /api/objectives/:id    → Modifier un objectif
 * DELETE /api/objectives/:id    → Supprimer un objectif
 */

const express = require("express");
const router  = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createObjective,
  getObjectives,
  getObjectiveById,
  updateObjective,
  deleteObjective,
} = require("../controllers/objectiveController");

router.get   ("/",    protect, getObjectives);
router.post  ("/",    protect, createObjective);
router.get   ("/:id", protect, getObjectiveById);
router.put   ("/:id", protect, updateObjective);
router.delete("/:id", protect, deleteObjective);

module.exports = router;