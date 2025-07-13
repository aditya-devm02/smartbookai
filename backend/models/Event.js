const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // e.g., yogafest2025
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branding: {
    logoUrl: String,
    primaryColor: String,
    secondaryColor: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema); 