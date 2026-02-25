const userwModel = require("../model/user_model");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { passwordRegex, emailRegex } = require("../utils/validade");

//@desc register a user
//@route POST /api/users/register
//@access public
const register = asyncHandler(async (req, res) => {
  const { nom, prenom, numero_telephone, email, mot_de_passe } = req.body;

  if (!nom || !prenom || !numero_telephone || !email || !mot_de_passe) {
    return res.status(400).json({
      message: "certains champ sont requis",
      success: false,
    });
  }

  // Vérification email
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Format d'email invalide",
    });
  }

  // Vérification mot de passe
  if (!passwordRegex.test(mot_de_passe)) {
    return res.status(400).json({
      message:
        "Mot de passe faible doit contenir minimum 8 caractères, 1 maj, 1 min, 1 chiffre et 1 symbole.",
      successs: false,
    });
  }

  // Vérification existence user
  const userAvailable = await userwModel.findOne({ email });
  if (userAvailable) {
    return res.status(400).json({
      message: "l'utilisateur existe déjà",
      success: false,

    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

  // Création utilisateur (UNE seule fois)
  const user = await userwModel.create({
    nom,
    prenom,
    numero_telephone,
    email,
    mot_de_passe: hashedPassword,
  });
  // const userId = req.user?._id;
  if (user) {
    const token = jwt.sign(
      { id: user._id, isVerified: user.isVerified, firstLogin: true },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    return res.status(201).json({
      message: "Compte créé avec succès. Vérification requise.",
      _id: user._id,
      prenom: user.prenom,
      numero_telephone: user.numero_telephone,
      email: user.email,
      isVerified: user.isVerified, // false
      firstLogin: true, // info frontend
      token,
    });
  } if (!user.isVerified) {
  return res.status(403).json({
    success: false,
    message: "Veuillez vérifier votre compte avant de vous connecter",
  });
}else {
    return res.status(400).json({
      message: "Erreur lors de la création",
    });
  }
});

//@desc login a user
//@route POST /api/users/login
//@access public
const login = asyncHandler(async (req, res) => {
  console.log("req.body", req.body);

  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) {
    return res.status(400).json({
      message: "champs obligatoires",
      success: false,
    });
  }
  // Vérifier si l’utilisateur existe
  const user = await userwModel.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Utilisateur introuvable.",
    });
  }
  //  Vérifier le mot de passe
  const passwordMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: "utilisateur introuvable ",
    });
  }
  //  Générer le token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  // Réponse finale
  return res.status(200).json({
    success: true,
    message: "Connexion réussie.",
    token,
    user: {
      id: user._id,
      email: user.email,
      nom: user.nom,
    },
  });
});

// CURRENT USER
const current = asyncHandler(async (req, res) => {
  console.log(req);
  return res.status(200).json({
    success: true,
    message: "Informations utilisateur récupérées",
    user: req.user,
  });
});

module.exports = { register, login, current };
