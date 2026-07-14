const WaitlistEntry = require('../models/WaitlistEntry');

/**
 * @desc  Guest joins the waitlist
 * @route POST /api/waitlist
 * @access Private (protect)
 */
const joinWaitlist = async (req, res, next) => {
  try {
    const { guestName, guestPhone, guestCount, seatingPreference, notes } = req.body;

    // Check for existing active entry
    const existing = await WaitlistEntry.findOne({
      user: req.user._id,
      status: { $in: ['waiting', 'notified'] }
    });
    if (existing) {
      res.status(409);
      return next(new Error('You already have an active waitlist entry'));
    }

    const entry = await WaitlistEntry.create({
      user: req.user._id,
      guestName: guestName || req.user.name,
      guestPhone,
      guestCount,
      seatingPreference: seatingPreference || 'any',
      notes: notes || '',
      status: 'waiting',
      joinedAt: new Date()
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error('You already have an active waitlist entry'));
    }
    next(error);
  }
};

/**
 * @desc  Get guest's current waitlist entry
 * @route GET /api/waitlist/me
 * @access Private (protect)
 */
const getMyWaitlistEntry = async (req, res, next) => {
  try {
    const entries = await WaitlistEntry.find({ user: req.user._id })
      .sort({ joinedAt: -1 })
      .limit(5);
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Guest cancels their active waitlist entry
 * @route PATCH /api/waitlist/me/cancel
 * @access Private (protect)
 */
const cancelWaitlistEntry = async (req, res, next) => {
  try {
    const entry = await WaitlistEntry.findOne({
      user: req.user._id,
      status: { $in: ['waiting', 'notified'] }
    });
    if (!entry) {
      res.status(404);
      return next(new Error('No active waitlist entry found'));
    }
    entry.status = 'cancelled';
    await entry.save();
    res.status(200).json({ success: true, message: 'Waitlist entry cancelled', data: entry });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Admin gets full waitlist queue
 * @route GET /api/admin/waitlist
 * @access Private (admin)
 */
const adminGetWaitlist = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    else filter.status = { $in: ['waiting', 'notified'] };

    const entries = await WaitlistEntry.find(filter)
      .populate('user', 'name email phone')
      .sort({ joinedAt: 1 });

    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Admin updates a waitlist entry (wait time, status, notes)
 * @route PATCH /api/admin/waitlist/:id
 * @access Private (admin)
 */
const adminUpdateWaitlistEntry = async (req, res, next) => {
  try {
    const entry = await WaitlistEntry.findById(req.params.id);
    if (!entry) {
      res.status(404);
      return next(new Error('Waitlist entry not found'));
    }
    const allowed = ['status', 'estimatedWaitMinutes', 'notes'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) entry[f] = req.body[f]; });
    await entry.save();
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

module.exports = { joinWaitlist, getMyWaitlistEntry, cancelWaitlistEntry, adminGetWaitlist, adminUpdateWaitlistEntry };
