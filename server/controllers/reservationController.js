const Reservation = require('../models/Reservation');
const RestaurantTable = require('../models/RestaurantTable');
const { generateReservationNumber } = require('../utils/reservationNumber');
const { timeSlots } = require('../validators/reservationValidators');

/**
 * Get current time in Kolkata timezone context
 */
const getKolkataNow = () => {
  const temp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(temp);
};

/**
 * Parse input date and time slot in Kolkata timezone (+05:30)
 */
const parseKolkataDateTime = (dateStr, slotStr) => {
  const [time, modifier] = slotStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  return new Date(`${dateStr}T${paddedHours}:${paddedMinutes}:00+05:30`);
};

// ─── Guest: Check Availability ───────────────────────────────────────────────

/**
 * @desc  Get available time slots for a given date/preference
 * @route GET /api/reservations/availability
 * @access Private (protect)
 */
const getAvailability = async (req, res, next) => {
  try {
    const { date, guestCount, seatingPreference } = req.query;
    const parsedDate = new Date(date + 'T00:00:00Z');
    if (isNaN(parsedDate.getTime())) {
      res.status(400);
      return next(new Error('Invalid date format. Must be YYYY-MM-DD'));
    }
    const countGuests = parseInt(guestCount, 10) || 2;
    const tableFilter = { isActive: true, capacity: { $gte: countGuests } };
    if (seatingPreference && seatingPreference !== 'any') {
      tableFilter.seatingType = seatingPreference;
    }
    const eligibleTables = await RestaurantTable.find(tableFilter);
    const activeReservations = await Reservation.find({
      reservationDate: parsedDate,
      status: { $in: ['confirmed', 'guest_arrived', 'seated'] }
    });
    const kolkataNow = getKolkataNow();
    const maxDate = new Date(kolkataNow.getTime() + 30 * 24 * 60 * 60 * 1000);
    maxDate.setHours(23, 59, 59, 999);
    const slotDetails = [];
    for (const slot of timeSlots) {
      const slotTime = parseKolkataDateTime(date, slot);
      if (slotTime < kolkataNow || slotTime > maxDate) continue;
      const bookedTableIds = activeReservations
        .filter((r) => r.timeSlot === slot)
        .map((r) => (r.assignedTable || '').toString());
      const freeTables = eligibleTables.filter(
        (t) => !bookedTableIds.includes(t._id.toString())
      );
      slotDetails.push({
        timeSlot: slot,
        availableTablesCount: freeTables.length,
        isAvailable: freeTables.length > 0
      });
    }
    res.status(200).json({
      success: true,
      data: { date, guestCount: countGuests, seatingPreference: seatingPreference || 'any', slots: slotDetails }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Guest: Create Reservation ────────────────────────────────────────────────

/**
 * @desc  Create a new reservation (guest)
 * @route POST /api/reservations
 * @access Private (protect)
 */
const createReservation = async (req, res, next) => {
  try {
    const {
      date, timeSlot, guestCount,
      guestName, guestEmail, guestPhone,
      seatingPreference = 'any', occasion = 'none', specialRequest = ''
    } = req.body;

    const parsedDate = new Date(date + 'T00:00:00Z');
    const slotTime = parseKolkataDateTime(date, timeSlot);
    const kolkataNow = getKolkataNow();

    if (slotTime < kolkataNow) {
      res.status(400);
      return next(new Error('Cannot reserve a slot in the past'));
    }
    const maxDate = new Date(kolkataNow.getTime() + 30 * 24 * 60 * 60 * 1000);
    maxDate.setHours(23, 59, 59, 999);
    if (slotTime > maxDate) {
      res.status(400);
      return next(new Error('Bookings are only allowed up to 30 days in advance'));
    }

    // Generate unique reservation number
    let reservationNumber = generateReservationNumber();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await Reservation.findOne({ reservationNumber });
      if (!existing) break;
      reservationNumber = generateReservationNumber();
      attempts++;
    }

    const reservation = new Reservation({
      reservationNumber,
      user: req.user._id,
      guestName: guestName || req.user.name,
      guestEmail: guestEmail || req.user.email,
      guestPhone,
      reservationDate: parsedDate,
      timeSlot,
      guestCount,
      seatingPreference,
      occasion,
      specialRequest,
      status: 'pending',
      statusHistory: [{ status: 'pending', changedBy: req.user._id, timestamp: new Date() }]
    });

    await reservation.save();

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// ─── Guest: View Own Reservations ─────────────────────────────────────────────

/**
 * @desc  Get authenticated guest's reservations
 * @route GET /api/reservations
 * @access Private (protect)
 */
const getMyReservations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const reservations = await Reservation.find({ user: req.user._id })
      .populate('assignedTable')
      .sort({ reservationDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reservation.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: reservations.length,
      pagination: { page, limit, totalPages: Math.ceil(total / limit), total },
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

// ─── Guest: Get Single Reservation ────────────────────────────────────────────

/**
 * @desc  Get single reservation by reservationNumber (owner or admin)
 * @route GET /api/reservations/:reservationNumber
 * @access Private (protect)
 */
const getOneReservation = async (req, res, next) => {
  try {
    const { reservationNumber } = req.params;
    const reservation = await Reservation.findOne({ reservationNumber })
      .populate('assignedTable')
      .populate('user', 'name email phone');

    if (!reservation) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }

    const isOwner = reservation.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// ─── Guest: Update Reservation ────────────────────────────────────────────────

/**
 * @desc  Update eligible reservation (guest — only pending or confirmed)
 * @route PATCH /api/reservations/:reservationNumber
 * @access Private (protect)
 */
const updateReservation = async (req, res, next) => {
  try {
    const { reservationNumber } = req.params;
    const reservation = await Reservation.findOne({ reservationNumber });

    if (!reservation) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }
    if (reservation.user.toString() !== req.user._id.toString()) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }
    if (!['pending', 'confirmed'].includes(reservation.status)) {
      res.status(400);
      return next(new Error(`Reservation with status "${reservation.status}" cannot be updated`));
    }

    const allowed = ['date', 'timeSlot', 'guestCount', 'guestName', 'guestPhone', 'occasion', 'specialRequest'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'date') {
          reservation.reservationDate = new Date(req.body.date + 'T00:00:00Z');
        } else {
          reservation[field] = req.body[field];
        }
      }
    });

    await reservation.save();
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// ─── Guest: Cancel Reservation ────────────────────────────────────────────────

/**
 * @desc  Cancel own reservation (allowed on pending or confirmed)
 * @route PATCH /api/reservations/:reservationNumber/cancel
 * @access Private (protect)
 */
const cancelReservation = async (req, res, next) => {
  try {
    const { reservationNumber } = req.params;
    const reservation = await Reservation.findOne({ reservationNumber }).populate('assignedTable');

    if (!reservation) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }
    if (reservation.user.toString() !== req.user._id.toString()) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }
    if (!['pending', 'confirmed'].includes(reservation.status)) {
      res.status(400);
      return next(new Error(`Reservation cannot be cancelled (current status: ${reservation.status})`));
    }

    reservation.status = 'cancelled';
    reservation.statusHistory.push({ status: 'cancelled', changedBy: req.user._id, timestamp: new Date() });
    await reservation.save();

    res.status(200).json({ success: true, message: 'Reservation cancelled successfully', data: reservation });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Get All Reservations ──────────────────────────────────────────────

/**
 * @desc  Get all reservations with filters (admin)
 * @route GET /api/admin/reservations
 * @access Private (admin)
 */
const adminGetAllReservations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      filter.reservationDate = new Date(req.query.date + 'T00:00:00Z');
    }
    if (req.query.search) {
      filter.$or = [
        { reservationNumber: { $regex: req.query.search, $options: 'i' } },
        { guestName: { $regex: req.query.search, $options: 'i' } },
        { guestEmail: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const reservations = await Reservation.find(filter)
      .populate('assignedTable')
      .populate('user', 'name email phone')
      .sort({ reservationDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reservation.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: reservations.length,
      pagination: { page, limit, totalPages: Math.ceil(total / limit), total },
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Update Reservation Status ─────────────────────────────────────────

/**
 * @desc  Update reservation status (admin)
 * @route PATCH /api/admin/reservations/:reservationNumber/status
 * @access Private (admin)
 */
const adminUpdateStatus = async (req, res, next) => {
  try {
    const { reservationNumber } = req.params;
    const { status, note = '' } = req.body;

    const existing = await Reservation.findOne({ reservationNumber }).select('_id');
    if (!existing) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }

    const reservation = await Reservation.findOneAndUpdate(
      { reservationNumber },
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            changedBy: req.user._id,
            note,
            timestamp: new Date()
          }
        }
      },
      {
        new: true,
        runValidators: false
      }
    ).populate('assignedTable');

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Assign Table ──────────────────────────────────────────────────────

/**
 * @desc  Assign a table to a reservation (admin)
 * @route PATCH /api/admin/reservations/:reservationNumber/assign-table
 * @access Private (admin)
 */
const adminAssignTable = async (req, res, next) => {
  try {
    const { reservationNumber } = req.params;
    const { tableId } = req.body;

    const reservation = await Reservation.findOne({ reservationNumber });
    if (!reservation) {
      res.status(404);
      return next(new Error('Reservation not found'));
    }

    const table = await RestaurantTable.findById(tableId);
    if (!table || !table.isActive) {
      res.status(404);
      return next(new Error('Table not found or inactive'));
    }

    if (table.capacity < reservation.guestCount) {
      res.status(400);
      return next(
        new Error(
          `Table capacity (${table.capacity}) is less than guest count (${reservation.guestCount})`
        )
      );
    }

    const conflict = await Reservation.findOne({
      assignedTable: tableId,
      reservationDate: reservation.reservationDate,
      timeSlot: reservation.timeSlot,
      status: { $in: ['confirmed', 'guest_arrived', 'seated'] },
      _id: { $ne: reservation._id }
    });

    if (conflict) {
      res.status(409);
      return next(
        new Error(
          'This table is already assigned to another reservation for this date and time slot'
        )
      );
    }

    const shouldConfirm = reservation.status === 'pending';
    const update = {
      $set: {
        assignedTable: tableId,
        ...(shouldConfirm ? { status: 'confirmed' } : {})
      }
    };

    if (shouldConfirm) {
      update.$push = {
        statusHistory: {
          status: 'confirmed',
          changedBy: req.user._id,
          note: `Table ${table.tableNumber} assigned`,
          timestamp: new Date()
        }
      };
    }

    /*
     * Some older seeded reservations do not contain all fields that are now
     * required by the current Mongoose schema. A normal document.save() would
     * validate the entire legacy document and block table assignment.
     * This targeted update changes only operational fields.
     */
    const updatedReservation = await Reservation.findOneAndUpdate(
      { reservationNumber },
      update,
      {
        new: true,
        runValidators: false
      }
    ).populate('assignedTable');

    res.status(200).json({
      success: true,
      data: updatedReservation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  createReservation,
  getMyReservations,
  getOneReservation,
  updateReservation,
  cancelReservation,
  adminGetAllReservations,
  adminUpdateStatus,
  adminAssignTable
};
