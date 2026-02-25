/**
 * @file profileController.js
 * @description Controller pour la gestion complète du profil utilisateur.
 */

const asyncHandler = require("express-async-handler");
const Profile = require("../model/profileModel");

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/profile
// ══════════════════════════════════════════════════════════════════════════════
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(`[GET /api/profile] userId: ${userId}`);

  const profile = await Profile.findOne({ userId });

  if (!profile) {
    // 404 normal = l'utilisateur n'a pas encore créé son profil
    console.log(`[GET /api/profile] Aucun profil pour userId: ${userId}`);
    // On retourne sans throw pour ne pas crasher asyncHandler
    return res.status(404).json({ success: false, message: "Aucun profil trouvé." });
  }

  console.log(`[GET /api/profile] Profil trouvé: ${profile._id}`);
  res.status(200).json({ success: true, profile });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/profile
// ══════════════════════════════════════════════════════════════════════════════
const createOrUpdateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(`[POST /api/profile] userId: ${userId}`);
  console.log(`[POST /api/profile] body reçu:`, JSON.stringify(req.body, null, 2));

  const {
    nom, prenom, email, telephone, profession, bio,
    dateNaissance, ville, avatar,
    revenus, priorites,
    monnaie, langue,
    notifications, securite,
  } = req.body;

  if (!prenom || !nom || !profession) {
    console.log(`[POST /api/profile] ❌ Champs manquants — prenom:${prenom} nom:${nom} profession:${profession}`);
    res.status(400);
    throw new Error("Prénom, nom et profession sont obligatoires.");
  }

  let profile = await Profile.findOne({ userId });

  if (profile) {
    console.log(`[POST /api/profile] ✏️  Mise à jour du profil: ${profile._id}`);
    profile.nom           = nom           ?? profile.nom;
    profile.prenom        = prenom        ?? profile.prenom;
    profile.email         = email         ?? profile.email;
    profile.telephone     = telephone     ?? profile.telephone;
    profile.profession    = profession    ?? profile.profession;
    profile.bio           = bio           ?? profile.bio;
    profile.dateNaissance = dateNaissance ?? profile.dateNaissance;
    profile.ville         = ville         ?? profile.ville;
    profile.monnaie       = monnaie       ?? profile.monnaie;
    profile.langue        = langue        ?? profile.langue;

    if (avatar !== undefined && avatar !== "") profile.avatar = avatar;
    if (Array.isArray(revenus))   profile.revenus   = revenus;
    if (Array.isArray(priorites)) profile.priorites = priorites;

    if (notifications && typeof notifications === "object") {
      profile.notifications = { ...profile.notifications.toObject(), ...notifications };
    }
    if (securite && typeof securite === "object") {
      profile.securite = { ...profile.securite.toObject(), ...securite };
    }

    await profile.save();
    console.log(`[POST /api/profile] ✅ Profil mis à jour avec succès`);
    return res.status(200).json({ success: true, profile });
  }

  console.log(`[POST /api/profile] 🆕 Création d'un nouveau profil`);
  profile = await Profile.create({
    userId,
    nom:           nom           || "",
    prenom:        prenom        || "",
    email:         email         || "",
    telephone:     telephone     || "",
    profession:    profession    || "",
    bio:           bio           || "",
    dateNaissance: dateNaissance || null,
    ville:         ville         || "",
    avatar:        avatar        || "",
    revenus:       Array.isArray(revenus)   ? revenus   : [],
    priorites:     Array.isArray(priorites) ? priorites : [],
    monnaie:       monnaie       || "FCFA (XAF)",
    langue:        langue        || "Français",
    notifications: notifications || {},
    securite:      securite      || {},
  });

  console.log(`[POST /api/profile] ✅ Nouveau profil créé: ${profile._id}`);
  res.status(201).json({ success: true, profile });
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/profile
// ══════════════════════════════════════════════════════════════════════════════
const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(`[DELETE /api/profile] userId: ${userId}`);

  const profile = await Profile.findOneAndDelete({ userId });

  if (!profile) {
    res.status(404);
    throw new Error("Aucun profil à supprimer.");
  }

  console.log(`[DELETE /api/profile] ✅ Profil supprimé: ${profile._id}`);
  res.status(200).json({ success: true, message: "Profil supprimé avec succès." });
});

module.exports = { getProfile, createOrUpdateProfile, deleteProfile };