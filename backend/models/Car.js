import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  type: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: String, enum: ["Available", "Not Available"], default: "Available" },
  image: { type: String }, // URL or file path of the uploaded image
  description: { type: String, required: true },
  carNumber: { type: String, required: true },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Owner's ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cartedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  wishlistedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // 🔥 Wishlist field
}, { timestamps: true });
const Car = mongoose.model("Car", carSchema);

export default Car;
