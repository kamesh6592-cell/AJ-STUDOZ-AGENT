const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    title: String,
    content: String,
    userId: String,
    projectId: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
