const Transaction = require("../model/TransactionModel");
const Objective = require("../model/objectiveModel");

exports.computeDashboard = async (userId) => {
  const transactions = await Transaction.find({ user: userId });
  const objectives = await Objective.find({ user: userId });

  //  Total revenus & dépenses
  let totalIncome = 0;
  let totalExpense = 0;
  let expensesByCategory = {};

  transactions.forEach((t) => {
    if (t.type === "income") {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;

      expensesByCategory[t.category] =
        (expensesByCategory[t.category] || 0) + t.amount;
    }
  });

  //  Épargne actuelle
  const savings = totalIncome - totalExpense;

  //  Progression des objectifs
  const objectivesProgress = objectives.map((obj) => {
    const percentage = Math.min(
      Math.round((obj.currentAmount / obj.targetAmount) * 100),
      100
    );

    return {
      id: obj._id,
      name: obj.title,
      percentage,
      targetAmount: obj.targetAmount,
      currentAmount: obj.currentAmount,
      deadline: obj.date_limite,
    };
  });

  //  Messages intelligents
  const messages = [];

  objectivesProgress.forEach((obj) => {
    if (obj.percentage >= 50 && obj.percentage < 100) {
      messages.push(
        `Bravo ! Tu as déjà économisé ${obj.percentage}% pour ${obj.name}.`
      );
    }

    if (obj.percentage < 20) {
      messages.push(
        `Courage Ton objectif "${obj.name}" progresse lentement, mais chaque pas compte.`
      );
    }
  });

  //  Alerte dépenses excessives
  if (totalExpense > totalIncome * 0.7) {
    messages.push(
      "Attention Tes dépenses dépassent 70% de tes revenus."
    );
  }

  return {
    savings,
    totalIncome,
    totalExpense,
    expensesByCategory,
    objectivesProgress,
    messages,
  };
};
