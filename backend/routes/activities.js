const express = require('express');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { Parser } = require('json2csv');

const router = express.Router();

// Middleware to check admin
function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    req.user = decoded;
    console.log('isAdmin: req.user set to:', req.user);
    next();
  } catch (err) {
    console.error('isAdmin: JWT verification failed:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Middleware to enforce event isolation for activities
function activitiesEventIsolation(req, res, next) {
  try {
    console.log('activities.js activitiesEventIsolation called');
    
    // Defensive check for req.user
    if (!req.user || typeof req.user !== 'object') {
      console.log('activitiesEventIsolation: req.user is undefined or invalid:', req.user);
      return res.status(401).json({ message: 'User not authenticated (activitiesEventIsolation)' });
    }
    
    console.log('activitiesEventIsolation: req.user object:', req.user);
    console.log('activitiesEventIsolation: req.user.eventId:', req.user.eventId);
    
    const userEventId = req.user.eventId;
    console.log('activitiesEventIsolation: userEventId assigned:', userEventId);
    
    // Safely get eventId from various sources
    const eventId = req.query?.eventId || req.body?.eventId || req.params?.eventId;
    console.log('activitiesEventIsolation: eventId extracted:', eventId);
    
    console.log('activitiesEventIsolation: userEventId:', userEventId, 'eventId:', eventId);
    
    if (userEventId && eventId && userEventId !== eventId && userEventId.toString() !== eventId.toString()) {
      return res.status(403).json({ message: 'Access denied: event isolation enforced.' });
    }
    
    console.log('activitiesEventIsolation: calling next()');
    next();
  } catch (err) {
    console.error('activitiesEventIsolation error:', err);
    console.error('activitiesEventIsolation error stack:', err.stack);
    res.status(500).json({ message: 'Internal server error in activitiesEventIsolation' });
  }
}

// Get all activities for an event
router.get('/', async (req, res) => {
  try {
    const { eventId, search, category, date, minDuration, maxDuration, sort } = req.query;
    if (!eventId) return res.status(400).json({ message: 'eventId is required' });
    let query = { eventId };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (date) query.date = { $gte: new Date(date) };
    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = Number(minDuration);
      if (maxDuration) query.duration.$lte = Number(maxDuration);
    }
    let activitiesQuery = Activity.find(query);
    if (sort === 'popularity') activitiesQuery = activitiesQuery.sort({ popularity: -1 });
    if (sort === 'date') activitiesQuery = activitiesQuery.sort({ date: 1 });
    const activities = await activitiesQuery.lean();
    // Explicitly map all fields to ensure fee and upiId are included
    const result = activities.map(a => ({
      _id: a._id,
      title: a.title,
      description: a.description,
      category: a.category,
      date: a.date,
      duration: a.duration,
      slots: a.slots,
      popularity: a.popularity,
      imageUrl: a.imageUrl,
      eventId: a.eventId,
      maxBookingsPerUser: a.maxBookingsPerUser,
      maxTeammates: a.maxTeammates,
      fee: a.fee,
      upiId: a.upiId,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add activity (admin only, scoped to event)
router.post('/', isAdmin, activitiesEventIsolation, async (req, res) => {
  try {
    const { title, description, category, date, duration, slots, popularity, imageUrl, maxBookingsPerUser, maxTeammates } = req.body;
    const eventId = req.user.eventId;
    if (!eventId) return res.status(400).json({ message: 'eventId missing in admin token' });
    const activity = new Activity({ title, description, category, date, duration, slots, popularity, imageUrl, eventId, maxBookingsPerUser, maxTeammates });
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit activity (admin only, scoped to event)
router.put('/:id', isAdmin, activitiesEventIsolation, async (req, res) => {
  try {
    const eventId = req.user.eventId;
    const update = req.body;
    const activity = await Activity.findOneAndUpdate({ _id: req.params.id, eventId }, update, { new: true });
    if (!activity) return res.status(404).json({ message: 'Activity not found for your event' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete activity (admin only, scoped to event)
router.delete('/:id', isAdmin, activitiesEventIsolation, async (req, res) => {
  try {
    const eventId = req.user.eventId;
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, eventId });
    if (!activity) return res.status(404).json({ message: 'Activity not found for your event' });
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all bookings for an activity (admin only)
router.get('/:id/bookings', isAdmin, activitiesEventIsolation, async (req, res) => {
  try {
    const activityId = req.params.id;
    const bookings = await Booking.find({ activity: activityId })
      .populate('user', 'username email')
      .populate('activity', 'title date');
    // Defensive: filter out bookings with missing user/activity
    const safeBookings = bookings.filter(b => b.user && b.activity);
    res.json(safeBookings);
  } catch (err) {
    console.error('Error in /:id/bookings:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// Export bookings for an activity as CSV (admin only)
router.get('/:id/bookings/export', isAdmin, activitiesEventIsolation, async (req, res) => {
  try {
    const activityId = req.params.id;
    const bookings = await Booking.find({ activity: activityId })
      .populate('user', 'username email')
      .populate('activity', 'title date');
    
    const data = bookings.map(b => {
      // Format teammates as comma-separated strings
      const teammateNames = b.teammates?.map(t => t.name).join(', ') || '';
      const teammateEmails = b.teammates?.map(t => t.email).join(', ') || '';
      
      return {
        username: b.user?.username,
        email: b.user?.email,
        activity: b.activity?.title,
        activityDate: b.activity?.date,
        bookingDate: b.bookingDate,
        bookingId: b._id,
        teammateNames: teammateNames,
        teammateEmails: teammateEmails,
        totalTeammates: b.teammates?.length || 0
      };
    });
    
    const parser = new Parser({ 
      fields: [
        'username', 
        'email', 
        'activity', 
        'activityDate', 
        'bookingDate', 
        'bookingId',
        'teammateNames',
        'teammateEmails', 
        'totalTeammates'
      ] 
    });
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('bookings.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 