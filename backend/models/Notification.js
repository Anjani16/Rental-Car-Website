// backend/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["booking_request", "booking_approved", "booking_rejected"], 
    required: true 
  },
  relatedBooking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking" 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);