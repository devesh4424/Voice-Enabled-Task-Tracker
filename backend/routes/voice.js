const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { parseVoiceInput } = require('../utils/voiceParser');
const Task = require('../models/Task');

// Configure multer for audio file uploads (if needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

/**
 * POST /api/voice/parse
 * Parse transcribed text to extract task information
 * Body: { transcript: string }
 */
router.post('/parse', [
  body('transcript').trim().notEmpty().withMessage('Transcript is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript cannot be empty' });
    }

    // Parse the voice input using AI
    const parsedData = await parseVoiceInput(transcript);

    // Return both the transcript and parsed data for review
    res.json({
      transcript: transcript,
      parsed: parsedData
    });
  } catch (error) {
    console.error('Error parsing voice input:', error);
    res.status(500).json({ 
      error: 'Failed to parse voice input',
      message: error.message 
    });
  }
});

/**
 * POST /api/voice/create
 * Create a task from parsed voice input
 * Body: { transcript: string, parsed: { title, description, status, priority, dueDate } }
 */
router.post('/create', [
  body('parsed.title').trim().notEmpty().withMessage('Title is required'),
  body('parsed.description').optional().trim(),
  body('parsed.status').optional().isIn(['To Do', 'In Progress', 'Done']),
  body('parsed.priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('parsed.dueDate').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { parsed } = req.body;

    const task = new Task({
      title: parsed.title,
      description: parsed.description || '',
      status: parsed.status || 'To Do',
      priority: parsed.priority || 'Medium',
      dueDate: parsed.dueDate || null
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task from voice:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

module.exports = router;



