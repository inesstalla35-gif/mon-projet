/**
 * @file objectiveController.js
 * @description Controller CRUD complet pour les objectifs financiers.
 */

const asyncHandler = require("express-async-handler");
const Objective = require("../model/objectiveModel");

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/objectives — Créer un objectif
// ══════════════════════════════════════════════════════════════════════════════
const createObjective = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(`[POST /api/objectives] userId: ${userId}`);
  console.log(`[POST /api/objectives] body:`, JSON.stringify(req.body, null, 2));

  const {
    titre,
    montant_cible,
    montant_actuel,
    date_de_debut,
    date_limite,
    categorie,
    frequence_epargne,
    priorite,
    note,
  } = req.body;

  // Validation
  if (!titre || !montant_cible || !date_limite) {
    res.status(400);
    throw new Error("Le titre, le montant cible et la date limite sont requis.");
  }

  // Limite de 5 objectifs actifs
  const activeCount = await Objective.countDocuments({ user: userId, status: "actif" });
  if (activeCount >= 5) {
    res.status(403);
    throw new Error("Vous avez atteint la limite de 5 objectifs actifs.");
  }

  const objective = await Objective.create({
    user:             userId,
    titre,
    montant_cible:    parseFloat(montant_cible),
    montant_actuel:   parseFloat(montant_actuel) || 0,
    date_de_debut:    date_de_debut || new Date(),
    date_limite,
    categorie:        categorie        || "autre",
    frequence_epargne:frequence_epargne || "monthly",
    priorite:         priorite         || "normal",
    note:             note             || "",
  });

  console.log(`[POST /api/objectives] ✅ Objectif créé: ${objective._id}`);
  res.status(201).json({ success: true, objective });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/objectives — Récupérer tous les objectifs de l'utilisateur
// ══════════════════════════════════════════════════════════════════════════════
const getObjectives = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(`[GET /api/objectives] userId: ${userId}`);

  const objectives = await Objective.find({ user: userId }).sort({ date_limite: 1 });

  console.log(`[GET /api/objectives] ${objectives.length} objectif(s) trouvé(s)`);
  res.status(200).json({ success: true, objectives });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/objectives/:id — Récupérer un objectif par ID
// ══════════════════════════════════════════════════════════════════════════════
const getObjectiveById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id }  = req.params;

  const objective = await Objective.findOne({ _id: id, user: userId });

  if (!objective) {
    res.status(404);
    throw new Error("Objectif introuvable.");
  }

  res.status(200).json({ success: true, objective });
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/objectives/:id — Mettre à jour un objectif
// ══════════════════════════════════════════════════════════════════════════════
const updateObjective = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id }  = req.params;
  console.log(`[PUT /api/objectives/${id}] userId: ${userId}`);
  console.log(`[PUT /api/objectives/${id}] body:`, JSON.stringify(req.body, null, 2));

  const objective = await Objective.findOne({ _id: id, user: userId });

  if (!objective) {
    res.status(404);
    throw new Error("Objectif introuvable ou non autorisé.");
  }

  const {
    titre, montant_cible, montant_actuel,
    date_de_debut, date_limite,
    categorie, frequence_epargne, priorite, note, status,
  } = req.body;

  if (titre            !== undefined) objective.titre             = titre;
  if (montant_cible    !== undefined) objective.montant_cible     = parseFloat(montant_cible);
  if (montant_actuel   !== undefined) objective.montant_actuel    = parseFloat(montant_actuel);
  if (date_de_debut    !== undefined) objective.date_de_debut     = date_de_debut;
  if (date_limite      !== undefined) objective.date_limite       = date_limite;
  if (categorie        !== undefined) objective.categorie         = categorie;
  if (frequence_epargne!== undefined) objective.frequence_epargne = frequence_epargne;
  if (priorite         !== undefined) objective.priorite          = priorite;
  if (note             !== undefined) objective.note              = note;
  if (status           !== undefined) objective.status            = status;

  // Si montant_actuel >= montant_cible → objectif terminé automatiquement
  if (objective.montant_actuel >= objective.montant_cible) {
    objective.status = "terminé";
  }

  await objective.save();
  console.log(`[PUT /api/objectives/${id}] ✅ Objectif mis à jour`);
  res.status(200).json({ success: true, objective });
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/objectives/:id — Supprimer un objectif
// ══════════════════════════════════════════════════════════════════════════════
const deleteObjective = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id }  = req.params;
  console.log(`[DELETE /api/objectives/${id}] userId: ${userId}`);

  const objective = await Objective.findOneAndDelete({ _id: id, user: userId });

  if (!objective) {
    res.status(404);
    throw new Error("Objectif introuvable ou non autorisé.");
  }

  console.log(`[DELETE /api/objectives/${id}] ✅ Objectif supprimé`);
  res.status(200).json({ success: true, message: "Objectif supprimé avec succès." });
});

module.exports = {
  createObjective,
  getObjectives,
  getObjectiveById,
  updateObjective,
  deleteObjective,
};