const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Define Schemas
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

const projectSchema = new mongoose.Schema({
    title: String,
    messages: Array,
    provider: String,
    userId: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const historySchema = new mongoose.Schema({
    title: String,
    content: String,
    userId: String,
    projectId: String,
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const History = mongoose.model('History', historySchema);

// Routes
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token, userData } = req.body;
        
        // Verify the token with Google
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        const { sub, email, name, picture } = response.data;
        
        // Check if user exists
        let user = await User.findOne({ googleId: sub });
        
        if (!user) {
            // Create new user
            user = new User({
                googleId: sub,
                name,
                email,
                picture,
                token
            });
            await user.save();
        } else {
            // Update user token
            user.token = token;
            await user.save();
        }
        
        res.json({
            success: true,
            token: user.token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ success: false, message: 'Authentication failed' });
    }
});

app.get('/api/user/data', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const user = await User.findOne({ token });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        const projects = await Project.find({ userId: user._id });
        
        res.json({
            success: true,
            projects: projects || [],
            stats: user.stats
        });
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const user = await User.findOne({ token });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        const project = new Project({
            ...req.body,
            userId: user._id
        });
        
        await project.save();
        
        // Update user stats
        user.stats.projects += 1;
        await user.save();
        
        res.json({ success: true, project });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, provider, apiKey, userId, imageData, options } = req.body;
        
        let response;
        
        // Call the appropriate AI provider
        switch (provider) {
            case 'claude':
                response = await callClaudeAPI(messages, apiKey, options);
                break;
            case 'gemini':
                response = await callGeminiAPI(messages, apiKey, options);
                break;
            case 'groq':
                response = await callGroqAPI(messages, apiKey, options);
                break;
            case 'zai':
                response = await callZaiAPI(messages, apiKey, options);
                break;
            default:
                throw new Error('Unsupported provider');
        }
        
        // Update user stats if userId is provided
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                user.stats.apiCalls += 1;
                await user.save();
            }
        }
        
        res.json({ success: true, content: response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error' 
        });
    }
});

// AI Provider API Functions
async function callClaudeAPI(messages, apiKey, options) {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-opus-20240229',
        max_tokens: options.length || 2000,
        temperature: options.creativity / 100,
        messages: [
            {
                role: 'user',
                content: options.systemPrompt + "\n\n" + messages[messages.length - 1].content
            }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        }
    });
    
    return response.data.content[0].text;
}

async function callGeminiAPI(messages, apiKey, options) {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        contents: [{
            parts: [{
                text: options.systemPrompt + "\n\n" + messages[messages.length - 1].content
            }]
        }],
        generationConfig: {
            temperature: options.creativity / 100,
            maxOutputTokens: options.length || 2000,
        }
    });
    
    return response.data.candidates[0].content.parts[0].text;
}

async function callGroqAPI(messages, apiKey, options) {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama3-70b-8192',
        messages: [
            {
                role: 'system',
                content: options.systemPrompt
            },
            {
                role: 'user',
                content: messages[messages.length - 1].content
            }
        ],
        temperature: options.creativity / 100,
        max_tokens: options.length || 2000,
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.data.choices[0].message.content;
}

async function callZaiAPI(messages, apiKey, options) {
    // This is a placeholder for Z.ai API
    // Replace with actual Z.ai API implementation
    return "Z.ai API integration would be implemented here";
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
