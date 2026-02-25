// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv').config()
const connectDB = require('./config/connect_db')
const PORT = process.env.PORT ; //port 3000  
const authRoutes = require("./routes/user_routes")
const objectiveRoutes = require('./routes/objectiveRoute');
const profileRoutes = require("./routes/profileRoute");
const transactionsRoutes =require('./routes/TransactionRoute');
const dashboardRoutes = require("./routes/dashboardRoutes")





connectDB()
// Middleware : Permet au serveur de lire le JSON envoyé par le frontend
app.use(express.json());
app.use(cors())
app.use("/api/users", authRoutes)
app.use('/api/objectives', objectiveRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/transaction',transactionsRoutes);
// Une route de test simple
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


