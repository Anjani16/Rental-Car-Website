import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  car: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Car", 
    required: true 
  },
  renter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  hours: { 
    type: Number, 
    required: true,
    min: 1
  },
  totalPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "completed", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Update the car's availability when booking is approved
bookingSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    const Car = mongoose.model('Car');
    await Car.findByIdAndUpdate(this.car, { availability: 'Not Available' });
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;