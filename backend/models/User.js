const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    picture: String,
    token: String,
    apiKeys: {
        claude: String,
        gemini: String,
        groq: String,
        zai: String
    },
    stats: {
        projects: { type: Number, default: 0 },
        messages: { type: Number, default: 0 },
        apiCalls: { type: Number, default: 0 }
    },
    settings: {
        darkMode: { type: Boolean, default: true },
        aiSettings: {
            creativity: { type: Number, default: 70 },
            length: { type: Number, default: 2000 },
            focus: { type: Number, default: 50 },
            codeStyle: { type: String, default: 'modern' }
        }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
