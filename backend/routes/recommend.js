const express = require('express');
const Booking = require('../models/Booking');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to check auth
function isAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Middleware to enforce event isolation
function eventIsolation(req, res, next) {
  try {
    if (!req.user || typeof req.user !== 'object') {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userEventId = req.user.eventId;
    if (!userEventId) {
      return res.status(401).json({ message: 'User eventId missing in token' });
    }
    req.userEventId = userEventId;
    next();
  } catch (err) {
    console.error('eventIsolation error:', err);
    res.status(500).json({ message: 'Internal server error in eventIsolation' });
  }
}

// Get recommendations for user
router.get('/', isAuth, eventIsolation, async (req, res) => {
  try {
    // Get user's bookings for their specific event
    const bookings = await Booking.find({ 
      user: req.user.userId,
      eventId: req.userEventId 
    }).populate('activity');
    
    // Get all activities for the user's specific event
    const allActivities = await require('../models/Activity').find({ 
      eventId: req.userEventId 
    });
    
    const bookedIds = bookings.map(b => b.activity && b.activity._id.toString()).filter(Boolean);
    const activityHistory = bookings.map(b => b.activity && b.activity.category).filter(Boolean);

    // Debug log
    console.log('Recommend debug:', {
      userEventId: req.userEventId,
      allActivitiesCount: allActivities.length,
      bookedIds,
      activityHistory
    });

    // If no activities available, return empty recommendations
    if (allActivities.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Send both booking history and all activities to ML API
    let mlRes;
    try {
      mlRes = await axios.post('http://localhost:5001/recommend', {
        activity_history: activityHistory,
        booked_ids: bookedIds,
        all_activities: allActivities
      }, {
        timeout: 5000 // 5 second timeout
      });
      res.json(mlRes.data);
    } catch (mlErr) {
      console.error('ML API error:', mlErr?.response?.data || mlErr.message);
      
      // Fallback: return top 3 most popular activities from user's event
      const fallbackRecommendations = allActivities
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 3)
        .map(a => a.title);
      
      res.json({ 
        recommendations: fallbackRecommendations,
        fallback: true,
        message: 'Using fallback recommendations due to ML service unavailability'
      });
    }
  } catch (err) {
    console.error('Recommend route error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 