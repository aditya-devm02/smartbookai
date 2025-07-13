const express = require('express');
const Event = require('../models/Event');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

const router = express.Router();

// Get event details by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get event details by ID
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate QR code for event registration (admin only)
router.get('/:id/qr-code', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Create the registration URL
    const registrationUrl = `http://localhost:3000/signup?eventSlug=${event.slug}`;
    
    // Generate QR code as PNG
    const qrCodeBuffer = await QRCode.toBuffer(registrationUrl, {
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Set response headers for image download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="event-${event.slug}-qr.png"`);
    res.setHeader('Content-Length', qrCodeBuffer.length);
    
    res.send(qrCodeBuffer);
  } catch (err) {
    console.error('QR code generation error:', err);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// Generate QR code for event registration by slug
router.get('/slug/:slug/qr-code', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Create the registration URL
    const registrationUrl = `http://localhost:3000/signup?eventSlug=${event.slug}`;
    
    // Generate QR code as PNG
    const qrCodeBuffer = await QRCode.toBuffer(registrationUrl, {
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Set response headers for image download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="event-${event.slug}-qr.png"`);
    res.setHeader('Content-Length', qrCodeBuffer.length);
    
    res.send(qrCodeBuffer);
  } catch (err) {
    console.error('QR code generation error:', err);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

module.exports = router; 