// backend/routes/paymentRoutes.js

const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();

// Create Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create an order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Amount in paise (INR)
      currency: "INR",
      receipt: "receipt#1", // You can generate a dynamic receipt
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Order creation failed", error });
  }
});

module.exports = router;
