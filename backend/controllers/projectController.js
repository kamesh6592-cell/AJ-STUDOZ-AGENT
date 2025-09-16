const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { title, description, provider } = req.body;
    
    if (!title || !provider) {
      return res.status(400).json({ error: 'Title and provider are required' });
    }

    const project = new Project({
      title,
      description,
      provider
    });

    await project.save();
    
    res.status(201).json({
      success: true,
      project: {
        id: project._id,
        title: project.title,
        description: project.description,
        provider: project.provider,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        messageCount: project.messages.length
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, provider } = req.query;
    const query = {};
    
    if (provider) {
      query.provider = provider;
    }

    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title description provider createdAt updatedAt messages htmlOutput');

    const total = await Project.countDocuments(query);
    
    res.json({
      success: true,
      projects,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { title, description, messages, htmlOutput } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        messages,
        htmlOutput,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: error.message });
  }
};
