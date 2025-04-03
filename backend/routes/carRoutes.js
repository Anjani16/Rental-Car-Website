import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken"; // ✅ Use jwt to decode tokens
import path from "path";
import fs from "fs";
import { body, validationResult } from "express-validator";
import Car from "../models/Car.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Add a new car
router.post(
  "/",
  upload.single("image"),
  [
    body("brand").notEmpty().withMessage("Brand is required"),
    body("model").notEmpty().withMessage("Model is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("year").isNumeric().withMessage("Year must be a number"),
    body("mileage").notEmpty().withMessage("Mileage is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("availability").isIn(["Available", "Not Available"]).withMessage("Invalid availability status"),
    body("description").notEmpty().withMessage("Description is required"),
    body("carNumber").notEmpty().withMessage("Car number is required"),
    body("userId").notEmpty().withMessage("User ID is required"), // Ensure userId is provided
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { brand, model, type, year, mileage, price, availability, description, carNumber, userId } = req.body;
      console.log("File received:", req.file);

      // Get the file path of the uploaded image
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      console.log("image received:", image);

      const newCar = new Car({
        brand,
        model,
        type,
        year,
        mileage,
        price,
        availability,
        image, // Save the file path or URL
        description,
        carNumber,
        userId, // Use the userId from the request body
      });

      await newCar.save();
      res.status(201).json({ message: "Car added successfully!", car: newCar });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Fetch cars owned by a specific user
router.get("/user", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;
//  // ✅ Decode token to get userId
//  const decoded = jwt.verify(token, "your_jwt_secret"); // Change "your_jwt_secret" to your actual secret
//  const userId = decoded.userId;
    const cars = await Car.find({ userId });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCar = await Car.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: "Car updated successfully!", car: updatedCar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the car to get the image path
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Delete the image file if it exists
    if (car.image) {
      const filename = car.image.split("/").pop(); // Extract the filename (e.g., "car-image-12345.jpg")
      const imagePath = path.join(__dirname, "../uploads", filename); // Construct the full path to the image
      console.log("Image Path:", imagePath); // Log the image path
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the file
      }
    }

    // Delete the car from the database
    await Car.findByIdAndDelete(id);

    res.json({ message: "Car and associated image deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
import User from "../models/User.js"; // Import the User model

// Fetch all cars (for renters to view)
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find(); // Fetch all cars

    // Fetch owner details for each car
    const carsWithOwnerDetails = await Promise.all(
      cars.map(async (car) => {
        const owner = await User.findById(car.userId, "firstName phoneNumber"); // Fetch owner details
        return {
          ...car._doc, // Spread the car details
          owner: {
            firstName: owner.firstName,
            phoneNumber: owner.phoneNumber,
          },
        };
      })
    );

    res.json(carsWithOwnerDetails); // Send the response with owner details
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle wishlist for a car
router.post("/:id/wishlist", async (req, res) => {
  try {
    const { id } = req.params; // Car ID
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Verify and decode the token properly
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract user ID

    // ✅ Find the car by ID
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // ✅ Check if user already wishlisted
    const isWishlisted = car.wishlistedBy.includes(userId);

    if (isWishlisted) {
      // ✅ Remove from wishlist
      car.wishlistedBy = car.wishlistedBy.filter((id) => id.toString() !== userId);
    } else {
      // ✅ Add to wishlist
      car.wishlistedBy.push(userId);
    }

    await car.save();
    res.json({ message: "Wishlist updated successfully!", car });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/wishlist", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract user ID

    // Fetch wishlisted cars
    const wishlistedCars = await Car.find({ wishlistedBy: userId });

    // Fetch owner details for each car
    const carsWithOwnerDetails = await Promise.all(
      wishlistedCars.map(async (car) => {
        const owner = await User.findById(car.userId, "firstName phoneNumber");
        return {
          ...car._doc, // Spread car details
          owner:{
            firstName: owner.firstName,
            phoneNumber: owner.phoneNumber,
          },
        };
      })
    );

    res.json(carsWithOwnerDetails); // Send formatted response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add to cart
router.post("/:id/cart", async (req, res) => {
  try {
    console.log("Cart API Hit");
    const { id } = req.params; // Car ID
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const car = await Car.findById(id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Check if already in cart
    if (car.cartedBy.includes(userId)) {
      return res.status(400).json({ message: "Car already in cart" });
    }

    // Add to cart
    car.cartedBy.push(userId);
    await car.save();

    res.json({ message: "Added to cart successfully!", car });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete("/:id/cart", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const car = await Car.findById(id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Remove from cart
    car.cartedBy = car.cartedBy.filter(id => id.toString() !== userId);
    await car.save();

    res.json({ message: "Removed from cart successfully!", car });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's cart items
router.get("/cart", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find all cars where cartedBy includes userId
    const cartItems = await Car.find({ cartedBy: userId });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Other routes (update, delete, etc.) remain unchanged
export default router;