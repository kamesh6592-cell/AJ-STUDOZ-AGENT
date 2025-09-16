const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      enum: ['claude', 'gemini', 'groq', 'zai']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  provider: {
    type: String,
    enum: ['claude', 'gemini', 'groq', 'zai'],
    required: true
  },
  htmlOutput: {
    type: String
  },
  files: [{
    name: String,
    path: String,
    size: Number,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
