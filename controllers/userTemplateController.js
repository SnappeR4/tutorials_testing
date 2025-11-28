const UserTemplate = require('../models/UserTemplate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/templates/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

class UserTemplateController {
  
  // Get all templates for user
  async getUserTemplates(req, res) {
    try {
      const { userIdentifier, identifierType } = req.params;
      
      const templates = await UserTemplate.find({
        userIdentifier,
        identifierType,
        isActive: true
      }).sort({ lastModified: -1 });
      
      res.json({
        success: true,
        data: templates,
        count: templates.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch templates',
        error: error.message
      });
    }
  }

  // Upload template with ZIP file
  async uploadTemplate(req, res) {
    try {
      const {
        userIdentifier,
        identifierType,
        name,
        mainCategory,
        templateCategory,
        templateDevice,
        templateSource = 'LocalTemplates',
        templateUser = 'AllUser',
        jsonData
      } = req.body;

      // Check if template already exists
      const existingTemplate = await UserTemplate.findOne({
        userIdentifier,
        identifierType,
        name,
        mainCategory,
        templateCategory
      });

      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: 'Template with same name and category already exists'
        });
      }

      const templateData = {
        userIdentifier,
        identifierType,
        name,
        mainCategory,
        templateCategory,
        templateDevice: templateDevice || 'Unknown',
        templateSource,
        templateUser,
        jsonData,
        localId: req.body.localId || uuidv4(),
        syncStatus: 'synced'
      };

      // If file was uploaded, store file path
      if (req.file) {
        templateData.filePath = req.file.path;
        templateData.fileName = req.file.originalname;
        templateData.fileSize = req.file.size;
      }

      const newTemplate = new UserTemplate(templateData);
      await newTemplate.save();

      res.status(201).json({
        success: true,
        message: 'Template uploaded successfully',
        data: newTemplate
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload template',
        error: error.message
      });
    }
  }

  // Download template ZIP file
  async downloadTemplate(req, res) {
    try {
      const { templateId } = req.params;
      
      const template = await UserTemplate.findById(templateId);
      
      if (!template || !template.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      if (!template.filePath || !fs.existsSync(template.filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Template file not found'
        });
      }

      res.download(template.filePath, template.fileName || `template_${templateId}.zip`);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to download template',
        error: error.message
      });
    }
  }

  // Update template
  async updateTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const updateData = req.body;

      const template = await UserTemplate.findById(templateId);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Handle file upload if provided
      if (req.file) {
        // Delete old file if exists
        if (template.filePath && fs.existsSync(template.filePath)) {
          fs.unlinkSync(template.filePath);
        }
        
        updateData.filePath = req.file.path;
        updateData.fileName = req.file.originalname;
        updateData.fileSize = req.file.size;
      }

      updateData.lastModified = new Date();
      updateData.syncStatus = 'synced';

      const updatedTemplate = await UserTemplate.findByIdAndUpdate(
        templateId,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Template updated successfully',
        data: updatedTemplate
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update template',
        error: error.message
      });
    }
  }

  // Delete template
  async deleteTemplate(req, res) {
    try {
      const { templateId } = req.params;

      const template = await UserTemplate.findById(templateId);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Delete associated file
      if (template.filePath && fs.existsSync(template.filePath)) {
        fs.unlinkSync(template.filePath);
      }

      await UserTemplate.findByIdAndDelete(templateId);

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete template',
        error: error.message
      });
    }
  }

  // Soft delete template
  async softDeleteTemplate(req, res) {
    try {
      const { templateId } = req.params;

      const template = await UserTemplate.findByIdAndUpdate(
        templateId,
        { isActive: false, lastModified: new Date() },
        { new: true }
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete template',
        error: error.message
      });
    }
  }

  // Sync templates (bulk operation)
  async syncTemplates(req, res) {
    try {
      const { userIdentifier, identifierType, templates } = req.body;

      const results = {
        uploaded: 0,
        updated: 0,
        failed: 0,
        errors: []
      };

      for (const templateData of templates) {
        try {
          const existingTemplate = await UserTemplate.findOne({
            userIdentifier,
            identifierType,
            name: templateData.name,
            mainCategory: templateData.mainCategory,
            templateCategory: templateData.templateCategory
          });

          if (existingTemplate) {
            // Update existing template
            await UserTemplate.findByIdAndUpdate(
              existingTemplate._id,
              {
                ...templateData,
                lastModified: new Date(),
                syncStatus: 'synced'
              }
            );
            results.updated++;
          } else {
            // Create new template
            const newTemplate = new UserTemplate({
              userIdentifier,
              identifierType,
              ...templateData,
              syncStatus: 'synced'
            });
            await newTemplate.save();
            results.uploaded++;
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            template: templateData.name,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: 'Sync completed',
        data: results
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Sync failed',
        error: error.message
      });
    }
  }
}

module.exports = { UserTemplateController, upload };