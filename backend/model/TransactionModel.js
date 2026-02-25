const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: {
      type: Number,
      required: true,
      min: [0, "Montant positif requis"],
    },
    category: { type: String, required: true },
    description: { type: String, trim: true, default: "" },
    beneficiaire: { type: String, trim: true, default: "" },
    date: { type: Date, default: Date.now },
    modePaiement: {
      type: String,
      enum: ["especes", "carte", "mobile", "virement", "cheque"],
      default: "especes",
    },
    tags: { type: [String], default: [] },
    isRecurring: { type: Boolean, default: false },
    period: {
      type: String,
      enum: ["none", "journalier", "hebdo", "mensuel"],
      default: "none",
    },
    source: { type: String, enum: ["manual", "profile"], default: "manual" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
