/**
 * @file objectiveModel.js
 * @description Modèle Mongoose pour les objectifs financiers.
 */

const mongoose = require("mongoose");

const objectiveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titre: {
      type: String,
      required: [true, "Veuillez donner un titre à votre objectif."],
      trim: true,
    },
    montant_cible: {
      type: Number,
      required: [true, "Veuillez spécifier le montant cible."],
      min: [1000, "Le montant minimum est de 1000 FCFA."],
    },
    montant_actuel: {
      type: Number,
      default: 0,
    },
    date_de_debut: {
      type: Date,
      required: [true, "Veuillez spécifier la date de début."],
    },
    date_limite: {
      type: Date,
      required: [true, "Veuillez spécifier la date limite."],
    },
    // Correspond exactement aux IDs du frontend
    categorie: {
      type: String,
      enum: ["voyage", "etudes", "famille", "materiel", "business", "sante", "logement", "urgence", "autre"],
      default: "autre",
    },
    frequence_epargne: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "monthly",
    },
    priorite: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["actif", "terminé", "archivé"],
      default: "actif",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Objective", objectiveSchema, "objectives");