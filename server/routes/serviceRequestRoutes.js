const express = require('express');
const router = express.Router();
const { protect, authorizeRoles, validate } = require('../middleware/authMiddleware');
const { createServiceRequestSchema, updateServiceRequestSchema } = require('../validators/serviceRequestValidators');
const {
  createServiceRequest, getMyServiceRequests, cancelServiceRequest,
  adminGetAllServiceRequests, adminUpdateServiceRequest
} = require('../controllers/serviceRequestController');

router.use(protect);

// Guest routes
router.post('/', validate(createServiceRequestSchema), createServiceRequest);
router.get('/me', getMyServiceRequests);
router.patch('/:id/cancel', cancelServiceRequest);

// Admin routes
router.get('/', authorizeRoles('admin'), adminGetAllServiceRequests);
router.patch('/:id', authorizeRoles('admin'), validate(updateServiceRequestSchema), adminUpdateServiceRequest);

module.exports = router;
