// require('dotenv').config();
// const express = require('express');
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import app from "./app.js";
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const authRoutes = require('./routes/auth');
import { port, dbrul } from './config.js';


// const app = express();

// // Middleware
app.use(cors({ origin: "https://car-rental-frontend-azure.vercel.app", credentials: true }));
// app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());

const PORT = port||5555;

// Connect to MongoDB
mongoose
  .connect(dbrul)
  .then(() => {console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes

// app.use('/api/auth', authRoutes);
// app.get("/", (req, res) => {
//   res.send("Car Rental Backend is Running!");
// });
// Start the server
// const PORT = port;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));