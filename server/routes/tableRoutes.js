const express = require('express');
const router = express.Router();
const { protect, authorizeRoles, validate } = require('../middleware/authMiddleware');
const { createTableSchema, updateTableSchema } = require('../validators/tableValidators');
const { getAllTables, getOneTable, createTable, updateTable, deactivateTable } = require('../controllers/tableController');

router.use(protect);

router.get('/', getAllTables);
router.get('/:id', getOneTable);
router.post('/', authorizeRoles('admin'), validate(createTableSchema), createTable);
router.patch('/:id', authorizeRoles('admin'), validate(updateTableSchema), updateTable);
router.patch('/:id/deactivate', authorizeRoles('admin'), deactivateTable);

module.exports = router;
