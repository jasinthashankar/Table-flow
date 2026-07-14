const { z } = require('zod');

const createServiceRequestSchema = z.object({
  reservationId: z.string({ required_error: 'Reservation ID is required' }).min(1),
  requestType: z.enum(['water', 'cleaning', 'assistance', 'birthday_setup', 'bill_request', 'other'], {
    errorMap: () => ({ message: 'Invalid request type' })
  }),
  message: z.string().max(500).optional().default(''),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal')
});

const updateServiceRequestSchema = z.object({
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid service request status' })
  })
});

module.exports = { createServiceRequestSchema, updateServiceRequestSchema };
