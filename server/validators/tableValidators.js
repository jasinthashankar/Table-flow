const { z } = require('zod');

const createTableSchema = z.object({
  tableNumber: z.string({ required_error: 'Table number is required' }).min(1).max(10),
  capacity: z.number({ required_error: 'Capacity is required' }).int().min(1).max(20),
  location: z.string().max(100).optional().default('Main Dining Room'),
  seatingType: z.enum(['window', 'garden', 'couple', 'family', 'group', 'standard'], {
    errorMap: () => ({ message: 'Invalid seating type' })
  }),
  notes: z.string().max(200).optional().default('')
});

const updateTableSchema = z.object({
  capacity: z.number().int().min(1).max(20).optional(),
  location: z.string().max(100).optional(),
  seatingType: z.enum(['window', 'garden', 'couple', 'family', 'group', 'standard']).optional(),
  status: z.enum(['available', 'reserved', 'occupied', 'cleaning', 'unavailable']).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(200).optional()
});

module.exports = { createTableSchema, updateTableSchema };
