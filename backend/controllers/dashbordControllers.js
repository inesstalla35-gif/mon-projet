const dashboardService = require("../services/dashboardservices");

exports.getDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardService.computeDashboard(req.user.id);
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({
      message: "Impossible de charger le tableau de bord",
    });
  }
};
