const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Direct-a `.env` la irundhu MongoDB Atlas URL-ah connect panrom
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected Successfully!'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// MongoDB Schema - Secret Data Save panna
const SecretSchema = new mongoose.Schema({
  fileName: String,
  secretKey: String,
  totalShares: Number,
  threshold: Number,
  createdAt: { type: Date, default: Date.now }
});

const SecretModel = mongoose.model('Secret', SecretSchema);

// API Route: React UI-la irundhu result-a database-ku save panna
app.post('/api/save-secret', async (req, res) => {
  try {
    const newSecret = new SecretModel(req.body);
    await newSecret.save();
    res.status(201).json({ message: 'Secret saved successfully to MongoDB Atlas' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save secret' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));