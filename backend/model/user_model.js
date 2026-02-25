const mongoose = require("mongoose");

const usershema = new mongoose.Schema(
  {
    nom: {
      type: String,
      require: [true, "veuillez ajouter votre nom"],
      trim: true,
    },
    prenom: {
      type: String,
      require: [true, "veuillez ajouter votre prenom"],
      trim: true,
    },
    numero_telephone: {
      type: String,
      require: [true, "veuillez ajouter votre numero de télephone"],
      unique: [true, "le contact est unique pour chaque utilisateur"],
    },
    email: {
      type: String,
      require: [true, "veuillez ajouter votre email"],
      unique: [true, "Email address already taken  "],
      trim: true,
    },
    mot_de_passe: {
      type: String,
      require: [true, "veuillez ajouter votre mot de passe  "],
      
    },
     isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    verifiedAt: Date
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("user", usershema, "user");
