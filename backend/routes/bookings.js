const express = require('express');
const Booking = require('../models/Booking');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const router = express.Router();

console.log('Loaded bookings.js from:', __filename);
console.log('--- bookings.js file contents at runtime ---');
console.log(fs.readFileSync(__filename, 'utf8'));
console.log('--- END bookings.js file contents at runtime ---');
console.log('bookings.js loaded');

// Middleware to check auth
function isAuth(req, res, next) {
  console.log('isAuth middleware called');
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded); // Debug log
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
}

// Middleware to enforce event isolation
function eventIsolation(req, res, next) {
  try {
    console.log('eventIsolation middleware (FINAL SAFE RESTORE) running');
    console.log('DEBUG: req.user =', req.user);
    console.log('DEBUG: req.user.eventId =', req.user ? req.user.eventId : undefined);
    if (!req.user || typeof req.user !== 'object') {
      console.error('eventIsolation: req.user is missing or not an object:', req.user);
      return res.status(401).json({ message: 'User not authenticated (eventIsolation)' });
    }
    const userEventId = req.user.eventId;
    if (!userEventId) {
      console.error('eventIsolation: req.user.eventId is missing:', req.user);
      return res.status(401).json({ message: 'User eventId missing in token' });
    }
    const eventId =
      (req.query && req.query.eventId) ||
      (req.body && req.body.eventId) ||
      (req.params && req.params.eventId);
    console.log('eventIsolation userEventId:', userEventId, 'eventId:', eventId);

    // Only compare if eventId is present and both are strings
    if (typeof eventId !== 'undefined' && eventId !== null) {
      if (String(userEventId) !== String(eventId)) {
        console.error('eventIsolation: eventId mismatch:', userEventId, eventId);
        return res.status(403).json({ message: 'Access denied: event isolation enforced.' });
      }
    }
    next();
  } catch (err) {
    console.error('eventIsolation CATCHED ERROR:', err);
    res.status(500).json({ message: 'Internal server error in eventIsolation', error: err.message, stack: err.stack });
  }
}

// Middleware to check admin
function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Email utility
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendBookingEmail(to, subject, html) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@smartbookai.com',
    to,
    subject,
    html,
  });
}

// Multer setup for payment proof uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// File upload endpoint for payment proof
router.post('/upload-proof', isAuth, upload.single('paymentProof'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the URL to the uploaded file
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

// Book an activity (event-scoped)
router.post('/', isAuth, eventIsolation, async (req, res) => {
  try {
    const { activityId, teammates, paymentProof, paymentTxnId } = req.body;
    const userEventId = req.user.eventId;
    const activity = await Activity.findById(activityId);
    if (!activity || !activity.eventId || !userEventId || !activity.eventId.equals(userEventId)) {
      return res.status(403).json({ message: 'You can only book activities for your event.' });
    }
    // Check for available slots
    if (activity.slots <= 0) {
      return res.status(400).json({ message: 'No slots available for this activity.' });
    }
    // Enforce max bookings per user
    const maxBookings = activity.maxBookingsPerUser || 1;
    const userBookingCount = await Booking.countDocuments({ user: req.user.userId, activity: activityId });
    if (userBookingCount >= maxBookings) {
      return res.status(400).json({ message: `You have reached the maximum number of bookings (${maxBookings}) for this activity.` });
    }
    // Enforce max teammates
    const maxTeammates = activity.maxTeammates || 0;
    let teammatesToSave = [];
    if (maxTeammates > 0) {
      if (!Array.isArray(teammates)) {
        return res.status(400).json({ message: `This activity allows up to ${maxTeammates} teammates. Please provide teammate details.` });
      }
      if (teammates.length > maxTeammates) {
        return res.status(400).json({ message: `You can add up to ${maxTeammates} teammates.` });
      }
      teammatesToSave = teammates.map(t => ({ name: t.name, email: t.email }));
    }
    // Determine payment status
    let paymentStatus = 'approved';
    if (activity.fee && activity.fee > 0) {
      paymentStatus = 'pending';
    }
    // Create booking (with eventId, teammates, payment proof, txnId, and status)
    const booking = new Booking({
      user: req.user.userId,
      activity: activityId,
      eventId: userEventId,
      teammates: teammatesToSave,
      paymentProof,
      paymentTxnId,
      paymentStatus
    });
    await booking.save();
    // Decrement slots and increment popularity only if paymentStatus is approved
    if (paymentStatus === 'approved') {
      activity.slots -= 1;
      activity.popularity = (activity.popularity || 0) + 1;
      await activity.save();
    }
    // Send booking confirmation email (only if approved)
    let emailWarning = null;
    if (paymentStatus === 'approved') {
      try {
        const user = await User.findById(req.user.userId);
        if (user && user.email) {
          const emailHtml = `
            <h2>Booking Confirmed!</h2>
            <p>Dear ${user.username},</p>
            <p>Your booking for <b>${activity.title}</b> is confirmed.</p>
            <ul>
              <li><b>Activity:</b> ${activity.title}</li>
              <li><b>Date:</b> ${activity.date ? new Date(activity.date).toLocaleString() : 'N/A'}</li>
              <li><b>Duration:</b> ${activity.duration || 'N/A'} minutes</li>
              <li><b>Event:</b> ${activity.eventId}</li>
            </ul>
            <p>Thank you for using SmartBookAI!</p>
          `;
          const info = await sendBookingEmail(user.email, 'Your Booking is Confirmed - SmartBookAI', emailHtml);
          console.log('Booking confirmation email sent:', info);
        }
      } catch (emailErr) {
        console.error('Failed to send booking email:', emailErr);
        emailWarning = emailErr && emailErr.message ? emailErr.message : 'Unknown error sending email';
      }
    }
    // Respond with booking and email status
    res.status(201).json({ booking, emailWarning });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's bookings (event-scoped)
router.get('/my', isAuth, eventIsolation, async (req, res) => {
  try {
    if (!req.user || !req.user.userId || !req.user.eventId) {
      console.error('Invalid user or event in token:', req.user);
      return res.status(400).json({ message: 'Invalid user or event in token' });
    }
    const userEventId = req.user.eventId;
    console.log('Bookings/my debug:', {
      userId: req.user.userId,
      eventId: userEventId,
      token: req.headers.authorization
    });
    const bookings = await Booking.find({ user: req.user.userId, eventId: userEventId }).populate('activity');
    console.log('Bookings found:', bookings);
    res.json(bookings);
  } catch (err) {
    console.error('Bookings/my error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Admin: Modify a booking
router.put('/:id', isAdmin, eventIsolation, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const update = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, update, { new: true })
      .populate('user', 'username email')
      .populate('activity', 'title date');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete a booking
router.delete('/:id', isAdmin, eventIsolation, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // Increment slots for the related activity
    const activity = await Activity.findById(booking.activity);
    if (activity) {
      activity.slots += 1;
      await activity.save();
    }
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel a booking (event-scoped)
router.delete('/:id', isAuth, eventIsolation, async (req, res) => {
  try {
    const userEventId = req.user.eventId;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.userId) return res.status(403).json({ message: 'Unauthorized' });
    if (!booking.eventId || !userEventId || !booking.eventId.equals(userEventId)) {
      return res.status(403).json({ message: 'Unauthorized for this event' });
    }
    const activity = await Activity.findById(booking.activity);
    if (activity) {
      activity.slots += 1;
      await activity.save();
    }
    await booking.deleteOne();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Approve payment
router.post('/:id/approve', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.paymentStatus = 'approved';
    await booking.save();
    // Decrement slots and increment popularity if not already done
    const activity = await Activity.findById(booking.activity);
    if (activity && activity.slots > 0) {
      activity.slots -= 1;
      activity.popularity = (activity.popularity || 0) + 1;
      await activity.save();
    }
    res.json({ message: 'Payment approved', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Reject payment
router.post('/:id/reject', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.paymentStatus = 'rejected';
    await booking.save();
    res.json({ message: 'Payment rejected', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 