const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');

const router = express.Router();

// Register (User for Event)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, eventSlug, eventId } = req.body;
    // Find event by slug or id first
    let event = null;
    if (eventId) {
      event = await Event.findById(eventId);
    } else if (eventSlug) {
      event = await Event.findOne({ slug: eventSlug });
    }
    if (!event) return res.status(400).json({ message: 'Event not found' });
    // Check for existing user with same email and eventId
    const existingUser = await User.findOne({ email, eventId: event._id });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, eventId: event._id, role: 'user' });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, username, email, eventId: event._id, role: 'user' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register Admin & Event
router.post('/register-admin-event', async (req, res) => {
  try {
    const { username, email, password, eventName, eventSlug, branding } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    // Check if event slug exists
    const existingEvent = await Event.findOne({ slug: eventSlug });
    if (existingEvent) return res.status(400).json({ message: 'Event slug already exists' });
    // Create event first
    const event = new Event({
      name: eventName,
      slug: eventSlug,
      branding: branding || {},
    });
    await event.save();
    // Create admin user with eventId
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({ username, email, password: hashedPassword, role: 'admin', eventId: event._id });
    await adminUser.save();
    // Update event with createdBy
    event.createdBy = adminUser._id;
    await event.save();
    res.status(201).json({ message: 'Admin & Event registered', event, user: { id: adminUser._id, username, email, role: 'admin', eventId: event._id } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin registration route
router.post('/admin-register', async (req, res) => {
  try {
    const { username, email, password, eventName, eventSlug, branding } = req.body;
    if (!username || !email || !password || !eventName || !eventSlug) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new admin user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      eventName,
      eventSlug,
      branding
    });
    await newUser.save();
    res.status(201).json({ message: 'Admin signup successful! Please login.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, username: user.username, email: user.email, role: user.role, eventId: user.eventId }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, eventId: user.eventId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 
