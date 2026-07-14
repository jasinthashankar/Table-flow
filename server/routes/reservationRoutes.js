const express = require('express');
const router = express.Router();
const { protect, authorizeRoles, validate } = require('../middleware/authMiddleware');
const {
  checkAvailabilitySchema,
  createReservationSchema,
  updateReservationSchema,
  adminUpdateStatusSchema,
  adminAssignTableSchema
} = require('../validators/reservationValidators');
const {
  getAvailability,
  createReservation,
  getMyReservations,
  getOneReservation,
  updateReservation,
  cancelReservation,
  adminGetAllReservations,
  adminUpdateStatus,
  adminAssignTable
} = require('../controllers/reservationController');

router.use(protect);

// Guest routes
router.get('/availability', validate(checkAvailabilitySchema, 'query'), getAvailability);
router.post('/', validate(createReservationSchema), createReservation);
router.get('/me', getMyReservations);
router.get('/:reservationNumber', getOneReservation);
router.patch('/:reservationNumber', validate(updateReservationSchema), updateReservation);
router.patch('/:reservationNumber/cancel', cancelReservation);

// Admin routes
router.get('/', authorizeRoles('admin'), adminGetAllReservations);
router.patch('/:reservationNumber/status', authorizeRoles('admin'), validate(adminUpdateStatusSchema), adminUpdateStatus);
router.patch('/:reservationNumber/assign-table', authorizeRoles('admin'), validate(adminAssignTableSchema), adminAssignTable);

module.exports = router;
