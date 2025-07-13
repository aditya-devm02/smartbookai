const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  date: { type: Date },
  duration: { type: Number }, // in minutes
  slots: { type: Number, default: 10 },
  popularity: { type: Number, default: 0 }, // number of bookings
  imageUrl: { type: String }, // image URL
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  maxBookingsPerUser: { type: Number, default: 1 }, // new: max bookings per user
  maxTeammates: { type: Number, default: 0 }, // new: max teammates per booking
  fee: { type: Number, default: 0 }, // new: activity fee (in paise/cents)
  upiId: { type: String, default: '' }, // new: UPI ID for payments
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema); 