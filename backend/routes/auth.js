import express from "express";
import User from "../models/User.js";  // ✅ Use import instead of require
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, userId, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const user = new User({ firstName, lastName, email, phoneNumber, userId, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'User Exists', error });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  console.log("Login request received:", req.body);  // 🛠️ Debugging log

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    console.log('Comparing passwords...'); // Log before bcrypt.compare
    console.log('User found:', user.email); // Log the user email
    console.log('Stored hashed password:', user.password); // Log the stored hash
    console.log('Password provided during login:', password); // Log the provided password

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid); // Log the result
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Verify the role
    if (user.role !== role) {
      return res.status(400).json({ message: `You are not a ${role}` });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error("🔥 Error during login:", error); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Protected route to fetch user details
router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
});

router.put("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { password, ...otherUpdates } = req.body;

    // Hash the new password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      otherUpdates.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: otherUpdates },
      { new: true }
    ).select("-password"); // Exclude password
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});
// module.exports = router;

// Delete user account
router.delete("/delete-account", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Delete the user from the database
    const user = await User.findByIdAndDelete(userId);
    if(!user)
    {
      return res.status(404).json({message: "User not found"});
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Error deleting account", error });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;
  console.log('Email:', email); // Log the email
  console.log('New password:', newPassword); // Log the new password

  if (!email || !newPassword) {
    console.log('Missing fields:', { email, newPassword });
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    console.log('Forgot password request received:', { email, newPassword }); // Log the request

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email); // Log if user not found
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('New password:', newPassword); // Log the new password
    console.log('Hashed password:', hashedPassword); // Log the hashed password

    // Update the user's password
    // Update user's password in one step
    user.password = hashedPassword;
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    console.log('Password updated successfully for:', email);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
