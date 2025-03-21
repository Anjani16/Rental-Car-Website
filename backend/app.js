import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // Needed for ES modules

// import bodyParser from "body-parser"; // Not needed if using express.json()
import authRoutes from "./routes/auth.js"; // Ensure this file exists
import carRoutes from "./routes/carRoutes.js"; // ✅ Import the cars route
// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(cors({
  origin: 'https://car-rental-frontend-azure.vercel.app', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow DELETE requests
  credentials: true,
}));
app.use(express.json()); // To parse incoming JSON requests
// app.use(bodyParser.json()); // Not needed since express.json() does this

// ✅ Serve images statically from the "uploads" folder
app.use("/uploads", express.static((path.join(__dirname, "uploads"))));


// Routes
app.use("/api/users/auth", authRoutes);
// Register Routes
app.use("/api/cars", carRoutes); // ✅ Register the cars API

app.get("/", (req, res) => {
  res.send("🚗 Car Rental Backend is Running!");
});

export default app; // Export app for use in server.js
