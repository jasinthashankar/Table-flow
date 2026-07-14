const ServiceRequest = require('../models/ServiceRequest');
const Reservation = require('../models/Reservation');

/**
 * @desc  Guest creates a service request (must have an active reservation)
 * @route POST /api/service-requests
 * @access Private (protect)
 */
const createServiceRequest = async (req, res, next) => {
  try {
    const { reservationId, requestType, message, priority } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }
    if (reservation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('You do not own this reservation'));
    }
    if (!['confirmed', 'guest_arrived', 'seated'].includes(reservation.status)) {
      res.status(400);
      return next(new Error('Service requests can only be created for active reservations (confirmed, guest_arrived, or seated)'));
    }

    const request = await ServiceRequest.create({
      user: req.user._id,
      reservation: reservationId,
      requestType,
      message: message || '',
      priority: priority || 'normal',
      status: 'open'
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get guest's own service requests
 * @route GET /api/service-requests
 * @access Private (protect)
 */
const getMyServiceRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const requests = await ServiceRequest.find({ user: req.user._id })
      .populate('reservation', 'reservationNumber reservationDate timeSlot status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ServiceRequest.countDocuments({ user: req.user._id });
    res.status(200).json({
      success: true, count: requests.length,
      pagination: { page, limit, totalPages: Math.ceil(total / limit), total },
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Guest cancels an open service request
 * @route PATCH /api/service-requests/:id/cancel
 * @access Private (protect)
 */
const cancelServiceRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      return next(new Error('Service request not found'));
    }
    if (request.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized'));
    }
    if (request.status !== 'open') {
      res.status(400);
      return next(new Error('Only open requests can be cancelled'));
    }
    request.status = 'cancelled';
    await request.save();
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Admin gets all service requests with filters
 * @route GET /api/admin/service-requests
 * @access Private (admin)
 */
const adminGetAllServiceRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.requestType) filter.requestType = req.query.requestType;
    if (req.query.priority) filter.priority = req.query.priority;

    const requests = await ServiceRequest.find(filter)
      .populate('user', 'name email')
      .populate('reservation', 'reservationNumber reservationDate timeSlot')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ServiceRequest.countDocuments(filter);
    res.status(200).json({
      success: true, count: requests.length,
      pagination: { page, limit, totalPages: Math.ceil(total / limit), total },
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Admin updates service request status
 * @route PATCH /api/admin/service-requests/:id
 * @access Private (admin)
 */
const adminUpdateServiceRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      return next(new Error('Service request not found'));
    }
    request.status = req.body.status;
    if (req.body.status === 'completed') request.completedAt = new Date();
    await request.save();
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createServiceRequest, getMyServiceRequests, cancelServiceRequest,
  adminGetAllServiceRequests, adminUpdateServiceRequest
};
