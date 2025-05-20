const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UserModel = require("./models/GroceryList");
const User = require("./models/Users.js");
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to the Wings database for grocery lists
mongoose.connect("mongodb://127.0.0.1:27017/Wings");

// Create a separate connection for ChildrenProfiles database
const childrenConnection = mongoose.createConnection(
  "mongodb://127.0.0.1:27017/ChildrenProfiles"
);

// Define child schema
const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0
  },
  imagePath: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Child model using the children connection
const ChildModel = childrenConnection.model("Child", childSchema);

// Define Payment schema
const paymentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroceryList',
    required: true
  },
  payment_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  item_name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'pending'],
    default: 'completed'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create Payment model
const Payment = mongoose.model('Payment', paymentSchema);

// Middleware to verify JWT and get user
const verifyToken = (req, res, next) => {
  // Get token from header
  const bearerHeader = req.headers.authorization;
  
  if (!bearerHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  
  // Extract token from Bearer header
  const token = bearerHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user data to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ----- GROCERY LIST ROUTES -----
app.get("/", (req, res) => {
  UserModel.find({})
    .then((grocerylists) => {
      res.json(grocerylists);
    })
    .catch((err) => res.json(err));
});

app.get("/getGroceryList/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findById(id)
    .then((grocerylists) => {
      res.json(grocerylists);
    })
    .catch((err) => res.json(err));
});

// Require admin permission for updates
app.put("/updateList/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized. Admin access required." });
  }
  
  UserModel.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
    },
    { new: true }
  )
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

// Require admin permission for deletes
app.delete("/deleteItem/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized. Admin access required." });
  }
  
  UserModel.findByIdAndDelete({ _id: id })
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});

// Require admin permission for creation
app.post("/addItem", verifyToken, (req, res) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized. Admin access required." });
  }
  
  UserModel.create(req.body)
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

// ----- PAYMENT ROUTES -----

// Save payment details
app.post("/api/save-payment", verifyToken, async (req, res) => {
  try {
    const { item_id, payment_id, amount, item_name, quantity, status = 'completed' } = req.body;
    
    // Create new payment record
    const payment = new Payment({
      user_id: req.user.id,
      item_id,
      payment_id,
      amount,
      item_name,
      quantity,
      status,
      timestamp: new Date()
    });
    
    await payment.save();
    
    res.json({ 
      success: true, 
      message: "Payment saved successfully",
      payment: payment
    });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error saving payment details" 
    });
  }
});

// Get payment history for current user
app.get("/api/payment-history", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user.id })
      .sort({ timestamp: -1 }); // Sort by latest first
    
    res.json({ 
      success: true, 
      payments: payments 
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching payment history" 
    });
  }
});

// Get all payments (admin only)
app.get("/api/all-payments", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized. Admin access required." });
    }
    
    const payments = await Payment.find({})
      .populate('user_id', 'name email')
      .sort({ timestamp: -1 });
    
    res.json({ 
      success: true, 
      payments: payments 
    });
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching payments" 
    });
  }
});

// ----- CHILDREN PROFILES ROUTES -----
app.get("/children", (req, res) => {
  ChildModel.find({})
    .sort({ createdAt: -1 }) // Sort by latest first
    .then((children) => {
      res.json(children);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.get("/children/:id", (req, res) => {
  const id = req.params.id;
  ChildModel.findById(id)
    .then((child) => {
      if (!child) {
        return res.status(404).json({ error: "Child profile not found" });
      }
      res.json(child);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post("/children", upload.single("image"), (req, res) => {
  try {
    const newChild = {
      name: req.body.name,
      age: req.body.age,
      description: req.body.description,
      amount: req.body.amount || 0,
    };

    // If image is uploaded, add the path to the item
    if (req.file) {
      newChild.imagePath = req.file.filename;
    }

    ChildModel.create(newChild)
      .then((child) => res.status(201).json(child))
      .catch((err) => res.status(400).json({ error: err.message }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/children/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;

  const updateData = {
    name: req.body.name,
    age: req.body.age,
    description: req.body.description,
    amount: req.body.amount || 0,
  };

  // If new image is uploaded, add it to update data
  if (req.file) {
    updateData.imagePath = req.file.filename;

    // Find the old image to delete it if there is one
    ChildModel.findById(id)
      .then((child) => {
        if (child && child.imagePath) {
          const oldImagePath = path.join(__dirname, "uploads", child.imagePath);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      })
      .catch((err) => console.log("Error deleting old image:", err));
  }

  ChildModel.findByIdAndUpdate(id, updateData, { new: true })
    .then((updatedChild) => {
      if (!updatedChild) {
        return res.status(404).json({ error: "Child profile not found" });
      }
      res.json(updatedChild);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.delete("/children/:id", (req, res) => {
  const id = req.params.id;

  // Find the profile to get image path before deleting
  ChildModel.findById(id)
    .then((child) => {
      if (!child) {
        return res.status(404).json({ error: "Child profile not found" });
      }

      // Delete the associated image file if it exists
      if (child.imagePath) {
        const imagePath = path.join(__dirname, "uploads", child.imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Delete the profile from the database
      return ChildModel.findByIdAndDelete(id);
    })
    .then(() => {
      res.json({ message: "Child profile deleted successfully" });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// ----- AUTH ROUTES -----

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Set isAdmin true if email is admin@example.com (for testing purposes)
    const isAdmin = email.toLowerCase() === 'admin@example.com';

    // Create new user with phone field
    const user = new User({
      name,
      email,
      password, // Will be hashed in pre-save hook
      phone,
      isAdmin
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token with user data
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin 
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return user data and token (excluding password)
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
app.get("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.json({ 
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// Update user profile
app.put("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    
    await user.save();
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      }
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Logout route - just for completeness, actual logout happens client-side
app.post("/api/auth/logout", (req, res) => {
  res.json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});