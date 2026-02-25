const Transaction = require("../model/TransactionModel");
const Profile     = require("../model/profileModel");

// ── GET ALL ──────────────────────────────────────────────────────────────────
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, transactions });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// ── GET INCOMES ───────────────────────────────────────────────────────────────
exports.getIncomes = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id, type: "income" }).sort({ date: -1 });
    res.json({ success: true, transactions });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// ── GET EXPENSES ──────────────────────────────────────────────────────────────
exports.getExpenses = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id, type: "expense" }).sort({ date: -1 });
    res.json({ success: true, transactions });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// ── ADD INCOME ────────────────────────────────────────────────────────────────
exports.addIncome = async (req, res) => {
  try {
    const { amount, category, date, description, beneficiaire,
            modePaiement, tags, isRecurring, period } = req.body;
    if (!amount)   return res.status(400).json({ message: "Montant requis" });
    if (!category) return res.status(400).json({ message: "Catégorie requise" });

    const transaction = await Transaction.create({
      user: req.user._id, type: "income",
      amount: parseFloat(amount), category,
      description: description || "",
      beneficiaire: beneficiaire || "",
      date: date ? new Date(date) : new Date(),
      modePaiement: modePaiement || "especes",
      tags: tags || [],
      isRecurring: isRecurring || false,
      period: period || "none",
      source: "manual",
    });
    res.status(201).json({ success: true, transaction });
  } catch (e) {
    console.error("[addIncome]", e);
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// ── ADD EXPENSE ───────────────────────────────────────────────────────────────
exports.addExpense = async (req, res) => {
  try {
    const { amount, category, date, description, beneficiaire,
            modePaiement, tags, isRecurring, period } = req.body;
    if (!amount)   return res.status(400).json({ message: "Montant requis" });
    if (!category) return res.status(400).json({ message: "Catégorie requise" });

    const transaction = await Transaction.create({
      user: req.user._id, type: "expense",
      amount: parseFloat(amount), category,
      description: description || "",
      beneficiaire: beneficiaire || "",
      date: date ? new Date(date) : new Date(),
      modePaiement: modePaiement || "especes",
      tags: tags || [],
      isRecurring: isRecurring || false,
      period: period || "none",
      source: "manual",
    });
    res.status(201).json({ success: true, transaction });
  } catch (e) {
    console.error("[addExpense]", e);
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// ── IMPORT PROFILE REVENUES ───────────────────────────────────────────────────
exports.importProfileRevenues = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    if (!profile?.revenus?.length)
      return res.json({ success: true, imported: 0 });

    let imported = 0;
    for (const rev of profile.revenus) {
      if (!rev.montant || rev.montant <= 0) continue;
      const exists = await Transaction.findOne({ user: userId, type: "income", source: "profile", category: rev.key });
      if (exists) continue;
      await Transaction.create({
        user: userId, type: "income", source: "profile",
        amount: rev.montant, category: rev.key,
        description: `Revenu profil : ${rev.label}`,
        modePaiement: "especes", isRecurring: true,
        period: rev.frequency === "mensuelle" ? "mensuel"
              : rev.frequency === "hebdomadaire" ? "hebdo"
              : rev.frequency === "quotidienne"  ? "journalier" : "mensuel",
      });
      imported++;
    }
    res.json({ success: true, imported });
  } catch (e) {
    console.error("[importProfile]", e);
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
exports.updateByType = async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!["income","expense"].includes(type))
      return res.status(400).json({ message: "Type invalide" });
    if (req.body.amount) req.body.amount = parseFloat(req.body.amount);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user._id, type }, req.body, { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction introuvable" });
    res.json({ success: true, transaction });
  } catch (e) {
    console.error("[update]", e);
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// ── DELETE ONE ────────────────────────────────────────────────────────────────
exports.deleteByType = async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!["income","expense"].includes(type))
      return res.status(400).json({ message: "Type invalide" });

    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id, type });
    if (!transaction) return res.status(404).json({ message: "Transaction introuvable" });
    res.json({ success: true, message: "Transaction supprimée" });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// ── DELETE MANY ───────────────────────────────────────────────────────────────
exports.deleteManyByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { ids }  = req.body;
    if (!["income","expense"].includes(type))
      return res.status(400).json({ message: "Type invalide" });
    if (!Array.isArray(ids) || !ids.length)
      return res.status(400).json({ message: "Tableau d'IDs requis" });

    const result = await Transaction.deleteMany({ _id: { $in: ids }, user: req.user._id, type });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};