const Transaction = require("../model/TransactionModel");
const Objective = require("../model/objectiveModel");


exports.checkUserNotifications = async (userId) => {
  const notifications = [];

  //  1. Pas de dépenses enregistrées cette semaine
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const expenses = await Transaction.find({
    user: userId,
    type: "expense",
    date: { $gte: oneWeekAgo },
  });

  if (expenses.length === 0) {
    notifications.push({
      message:
        "Vous n’avez pas renseigné vos dépenses cette semaine 📌",
      type: "warning",
    });
  }

  //  2. Objectifs proches de la date limite
  const now = new Date();
  const inSevenDays = new Date();
  inSevenDays.setDate(now.getDate() + 7);

  const objectives = await Objective.find({
    user: userId,
    date_limite: { $lte: inSevenDays },
  });

  objectives.forEach((obj) => {
    notifications.push({
      message: `Nous y sommes presque  Vous vous rapprochez de votre projet "${obj.title}"`,
      type: "success",
    });
  });

  //  3. Dépenses trop élevées
  const transactions = await Transaction.find({ user: userId });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  if (totalExpense > totalIncome * 0.8) {
    notifications.push({
      message:
        "Attention Votre budget est presque dépassé ce mois-ci",
      type: "warning",
    });
  }

  return notifications.slice(0, 3); 
};
