const mongoose = require("mongoose");

const db_connect = () => {
  mongoose
    .connect(process.env.DATABASE, {
      dbName: "Wisepocket",      // ⚡ force l'utilisation de la base Wisepocket
    })
    .then(() => {
      console.log("Connexion à la base Wisepocket réussie 🎉");
    })
    .catch((erreur) => {
      console.error("Erreur MongoDB :", erreur);
    });
};

module.exports = db_connect;
