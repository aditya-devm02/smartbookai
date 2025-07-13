const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Compound unique index: allow same email for different events, but unique per event
userSchema.index({ email: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema); 