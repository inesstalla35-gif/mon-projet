const express    = require("express");
const router     = express.Router();
const ctrl       = require("../controllers/TransactionController");
const protect    = require("../middleware/authMiddleware");

// GET
router.get("/",     protect, ctrl.getAllTransactions);
router.get("/",  protect, ctrl.getIncomes);
router.get("/", protect, ctrl.getExpenses);

// CREATE
router.post("/",         protect, ctrl.addIncome);
router.post("/",        protect, ctrl.addExpense);
router.post("/", protect, ctrl.importProfileRevenues);

// UPDATE
router.put("/:type/:id", protect, ctrl.updateByType);

// DELETE one
router.delete("/:type/:id", protect, ctrl.deleteByType);

// DELETE many  — body: { ids: [...] }
router.delete("/:type", protect, ctrl.deleteManyByType);

module.exports = router;