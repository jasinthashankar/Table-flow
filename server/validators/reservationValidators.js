const { z } = require('zod');

const phoneRegex = /^\d{10}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const timeSlots = [
  '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM',
  '6:00 PM', '7:30 PM', '9:00 PM'
];

const checkAvailabilitySchema = z.object({
  date: z.string({ required_error: 'Date is required' }).regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  guestCount: z.preprocess(
    (val) => parseInt(val, 10),
    z.number({ required_error: 'Guest count is required' }).int().min(1).max(20)
  ),
  seatingPreference: z
    .enum(['any', 'window', 'garden', 'couple', 'family', 'group', 'standard'])
    .optional()
    .default('any')
});

const createReservationSchema = z.object({
  date: z.string({ required_error: 'Date is required' }).regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.enum(timeSlots, { errorMap: () => ({ message: 'Invalid time slot selected' }) }),
  guestCount: z.number({ required_error: 'Guest count is required' }).int().min(1).max(20),
  guestName: z.string({ required_error: 'Guest name is required' }).min(2).max(60),
  guestEmail: z.string({ required_error: 'Guest email is required' }).email('Invalid email address'),
  guestPhone: z.string({ required_error: 'Guest phone is required' }).regex(phoneRegex, 'Invalid phone number'),
  seatingPreference: z
    .enum(['any', 'window', 'garden', 'couple', 'family', 'group', 'standard'])
    .optional()
    .default('any'),
  occasion: z
    .enum(['none', 'birthday', 'anniversary', 'date', 'family_dinner', 'business', 'other'])
    .optional()
    .default('none'),
  specialRequest: z.string().max(500).optional().default('')
});

const updateReservationSchema = z.object({
  date: z.string().regex(dateRegex).optional(),
  timeSlot: z.enum(timeSlots).optional(),
  guestCount: z.number().int().min(1).max(20).optional(),
  guestName: z.string().min(2).max(60).optional(),
  guestPhone: z.string().regex(phoneRegex).optional(),
  occasion: z.enum(['none', 'birthday', 'anniversary', 'date', 'family_dinner', 'business', 'other']).optional(),
  specialRequest: z.string().max(500).optional()
});

const adminUpdateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'guest_arrived', 'seated', 'completed', 'cancelled', 'no_show'], {
    errorMap: () => ({ message: 'Invalid reservation status' })
  }),
  note: z.string().max(300).optional().default('')
});

const adminAssignTableSchema = z.object({
  tableId: z.string({ required_error: 'Table ID is required' }).min(1)
});

module.exports = {
  checkAvailabilitySchema,
  createReservationSchema,
  updateReservationSchema,
  adminUpdateStatusSchema,
  adminAssignTableSchema,
  timeSlots
};
