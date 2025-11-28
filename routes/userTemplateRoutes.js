const express = require('express');
const router = express.Router();
const { UserTemplateController, upload } = require('../controllers/userTemplateController');

const controller = new UserTemplateController();

// Get user templates
router.get('/:userIdentifier/:identifierType', controller.getUserTemplates);

// Upload template with file
router.post('/upload', upload.single('templateFile'), controller.uploadTemplate);

// Download template file
router.get('/download/:templateId', controller.downloadTemplate);

// Update template
router.put('/:templateId', upload.single('templateFile'), controller.updateTemplate);

// Delete template
router.delete('/:templateId', controller.deleteTemplate);

// Soft delete template
router.patch('/:templateId/soft-delete', controller.softDeleteTemplate);

// Sync templates
router.post('/sync', controller.syncTemplates);

module.exports = router;