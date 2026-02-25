/**
 * @file profileModel.js
 * @description Modèle Mongoose pour le profil utilisateur complet.
 */

const mongoose = require("mongoose");

// ── Sous-schéma : Revenu ──────────────────────────────────────────────────────
const revenuSchema = new mongoose.Schema(
  {
    key:        { type: String, required: true },
    label:      { type: String, required: true },
    montant:    { type: Number, default: 0 },
    pctEpargne: { type: Number, default: 10 },
    frequency:  {
      type: String,
      enum: ["quotidienne", "hebdomadaire", "mensuelle", "variable"],
      default: "mensuelle",
    },
  },
  { _id: false }
);

// ── Sous-schéma : Priorité budgétaire ────────────────────────────────────────
const prioriteSchema = new mongoose.Schema(
  {
    key:     { type: String, required: true },
    label:   { type: String, required: true },
    montant: { type: Number, default: 0 },
    urgent:  { type: Boolean, default: false },
  },
  { _id: false }
);

// ── Sous-schéma : Notifications ───────────────────────────────────────────────
const notificationsSchema = new mongoose.Schema(
  {
    global:    { type: Boolean, default: true },
    budget:    { type: Boolean, default: true },
    objectifs: { type: Boolean, default: true },
    conseils:  { type: Boolean, default: false },
    rapports:  { type: Boolean, default: true },
  },
  { _id: false }
);

// ── Sous-schéma : Sécurité ────────────────────────────────────────────────────
const securiteSchema = new mongoose.Schema(
  {
    biometrie:  { type: Boolean, default: false },
    pinEnabled: { type: Boolean, default: false },
    autoLock:   { type: String, default: "5min" },
  },
  { _id: false }
);

// ── Schéma principal : Profil ─────────────────────────────────────────────────
const profileSchema = new mongoose.Schema(
  {
    // Lien vers l'utilisateur
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Identité ──────────────────────────────────────────────────────────────
    nom:           { type: String, trim: true, default: "" },
    prenom:        { type: String, trim: true, default: "" },
    email:         { type: String, trim: true, lowercase: true, default: "" },
    telephone:     { type: String, trim: true, default: "" },
    profession:    { type: String, trim: true, default: "" },
    bio:           { type: String, trim: true, default: "" },
    dateNaissance: { type: Date,   default: null },
    ville:         { type: String, trim: true, default: "" },
    avatar:        { type: String, default: "" }, // URI locale ou URL cloud

    // ── Finances ──────────────────────────────────────────────────────────────
    revenus:   { type: [revenuSchema],   default: [] },
    priorites: { type: [prioriteSchema], default: [] },

    // ── Préférences ───────────────────────────────────────────────────────────
    monnaie: { type: String, default: "FCFA (XAF)" },
    langue:  { type: String, default: "Français" },

    // ── Notifications ─────────────────────────────────────────────────────────
    notifications: { type: notificationsSchema, default: () => ({}) },

    // ── Sécurité ──────────────────────────────────────────────────────────────
    securite: { type: securiteSchema, default: () => ({}) },
  },
  {
    timestamps: true, // createdAt & updatedAt automatiques
  }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;