const { z } = require('zod');

const phoneRegex = /^\d{10}$/;

const joinWaitlistSchema = z.object({
  guestName: z.string({ required_error: 'Guest name is required' }).min(2).max(60),
  guestPhone: z.string({ required_error: 'Guest phone is required' }).regex(phoneRegex, 'Invalid phone number'),
  guestCount: z.number({ required_error: 'Guest count is required' }).int().min(1).max(20),
  seatingPreference: z
    .enum(['any', 'window', 'garden', 'couple', 'family', 'group', 'standard'])
    .optional()
    .default('any'),
  notes: z.string().max(300).optional().default('')
});

const adminUpdateWaitlistSchema = z.object({
  status: z.enum(['waiting', 'notified', 'seated', 'cancelled', 'expired'], {
    errorMap: () => ({ message: 'Invalid waitlist status' })
  }).optional(),
  estimatedWaitMinutes: z.number().int().min(0).optional(),
  notes: z.string().max(300).optional()
});

module.exports = { joinWaitlistSchema, adminUpdateWaitlistSchema };
