const Reservation = require('../models/Reservation');
const RestaurantTable = require('../models/RestaurantTable');
const WaitlistEntry = require('../models/WaitlistEntry');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

/**
 * @desc  Admin dashboard — live stats from MongoDB
 * @route GET /api/dashboard/admin
 * @access Private (admin)
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const [
      todaysReservations,
      pendingReservations,
      availableTables,
      occupiedTables,
      waitlistCount,
      openServiceRequests,
      totalGuests,
      totalReservations
    ] = await Promise.all([
      Reservation.countDocuments({ reservationDate: { $gte: todayStart, $lte: todayEnd } }),
      Reservation.countDocuments({ status: 'pending' }),
      RestaurantTable.countDocuments({ status: 'available', isActive: true }),
      RestaurantTable.countDocuments({ status: { $in: ['occupied', 'reserved'] }, isActive: true }),
      WaitlistEntry.countDocuments({ status: { $in: ['waiting', 'notified'] } }),
      ServiceRequest.countDocuments({ status: 'open' }),
      User.countDocuments({ role: 'customer', isActive: true }),
      Reservation.countDocuments({})
    ]);

    // Recent reservations (last 5)
    const recentReservations = await Reservation.find({})
      .populate('assignedTable', 'tableNumber')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('reservationNumber guestName status reservationDate timeSlot createdAt');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          todaysReservations,
          pendingReservations,
          availableTables,
          occupiedTables,
          waitlistCount,
          openServiceRequests,
          totalGuests,
          totalReservations
        },
        recentReservations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Guest dashboard — personal stats
 * @route GET /api/dashboard/guest
 * @access Private (protect)
 */
const getGuestDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [
      upcomingReservation,
      totalReservations,
      activeWaitlistEntry,
      openServiceRequests,
      recentReservations
    ] = await Promise.all([
      Reservation.findOne({
        user: userId,
        reservationDate: { $gte: now },
        status: { $in: ['pending', 'confirmed'] }
      })
        .populate('assignedTable', 'tableNumber location')
        .sort({ reservationDate: 1 }),
      Reservation.countDocuments({ user: userId }),
      WaitlistEntry.findOne({ user: userId, status: { $in: ['waiting', 'notified'] } }),
      ServiceRequest.countDocuments({ user: userId, status: 'open' }),
      Reservation.find({ user: userId })
        .sort({ reservationDate: -1 })
        .limit(5)
        .select('reservationNumber status reservationDate timeSlot guestCount')
    ]);

    res.status(200).json({
      success: true,
      data: {
        upcomingReservation,
        totalReservations,
        activeWaitlistEntry,
        openServiceRequests,
        recentReservations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminDashboard, getGuestDashboard };
