const RestaurantTable = require('../models/RestaurantTable');

/**
 * @desc  Get all tables (active only for guests, all for admin)
 * @route GET /api/tables
 * @access Private (protect)
 */
const getAllTables = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isActive: true };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.seatingType) filter.seatingType = req.query.seatingType;

    const tables = await RestaurantTable.find(filter).sort({ tableNumber: 1 });
    res.status(200).json({ success: true, count: tables.length, data: tables });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get single table by ID
 * @route GET /api/tables/:id
 * @access Private (protect)
 */
const getOneTable = async (req, res, next) => {
  try {
    const table = await RestaurantTable.findById(req.params.id);
    if (!table) {
      res.status(404);
      return next(new Error('Table not found'));
    }
    res.status(200).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Create a new table
 * @route POST /api/tables
 * @access Private (admin)
 */
const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, location, seatingType, notes } = req.body;

    const existing = await RestaurantTable.findOne({ tableNumber });
    if (existing) {
      res.status(409);
      return next(new Error(`Table number "${tableNumber}" already exists`));
    }

    const table = await RestaurantTable.create({
      tableNumber,
      capacity,
      location: location || 'Main Dining Room',
      seatingType,
      notes: notes || '',
      status: 'available',
      isActive: true
    });

    res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Update table details or status
 * @route PATCH /api/tables/:id
 * @access Private (admin)
 */
const updateTable = async (req, res, next) => {
  try {
    const table = await RestaurantTable.findById(req.params.id);
    if (!table) {
      res.status(404);
      return next(new Error('Table not found'));
    }

    const allowed = ['capacity', 'location', 'seatingType', 'status', 'isActive', 'notes'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) table[field] = req.body[field];
    });

    await table.save();
    res.status(200).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Deactivate a table (soft delete)
 * @route PATCH /api/tables/:id/deactivate
 * @access Private (admin)
 */
const deactivateTable = async (req, res, next) => {
  try {
    const table = await RestaurantTable.findById(req.params.id);
    if (!table) {
      res.status(404);
      return next(new Error('Table not found'));
    }
    table.isActive = false;
    table.status = 'unavailable';
    await table.save();
    res.status(200).json({ success: true, message: 'Table deactivated successfully', data: table });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTables, getOneTable, createTable, updateTable, deactivateTable };
