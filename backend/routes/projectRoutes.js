const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { validateApiKey } = require('../middleware/auth');

// Create project
router.post('/', validateApiKey, projectController.createProject);

// Get projects
router.get('/', validateApiKey, projectController.getProjects);

// Get single project
router.get('/:id', validateApiKey, projectController.getProject);

// Update project
router.put('/:id', validateApiKey, projectController.updateProject);

// Delete project
router.delete('/:id', validateApiKey, projectController.deleteProject);

module.exports = router;
