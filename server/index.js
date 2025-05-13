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
  imagePath: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Child model using the children connection
const ChildModel = childrenConnection.model("Child", childSchema);

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

app.put("/updateList/:id", (req, res) => {
  const id = req.params.id;
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

app.delete("/deleteItem/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findByIdAndDelete({ _id: id })
    .then((result) => res.json(result)) // Fixed variable shadowing issue
    .catch((err) => res.json(err));
});

app.post("/addItem", (req, res) => {
  UserModel.create(req.body)
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
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

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    // const saltRounds = 10;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);

    // console.log('init',hashedPassword)

    // Create new user
    const user = new User({
      name,
      email,
      password: password,
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

    console.log('compare',user.password)

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret_key", // Add a fallback secret key
      { expiresIn: "1d" }
    );

    // Return user data and token (excluding password)
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
