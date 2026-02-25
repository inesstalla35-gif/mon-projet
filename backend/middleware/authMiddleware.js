// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/user_model");

// Middleware pour protéger les routes et récupérer l'utilisateur depuis le token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Vérifie que le header contient un token Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-mot_de_passe");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      next(); // tout est ok, passe au controller
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token invalide ou expiré",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Aucun token trouvé. Accès interdit.",
    });
  }
});
const verifiedOnly = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Veuillez vérifier votre compte pour accéder à cette ressource",
    });
  }
  next();
};

module.exports = protect,verifiedOnly;
