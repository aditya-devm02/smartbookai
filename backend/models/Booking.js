const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  bookingDate: { type: Date, default: Date.now },
  teammates: [{ name: String, email: String }], // new: teammates info
  paymentProof: { type: String }, // URL to uploaded screenshot
  paymentTxnId: { type: String }, // UPI transaction ID
  paymentStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Manual review status
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema); 