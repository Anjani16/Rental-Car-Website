import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hours: { type: Number, default: 1, min: 1 }
});


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
  cartedBy: [cartItemSchema], // Now stores both userId and hours
  wishlistedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // 🔥 Wishlist field
}, { timestamps: true });
const Car = mongoose.model("Car", carSchema);

export default Car;
