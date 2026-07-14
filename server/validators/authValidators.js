const { z } = require('zod');

// Schema for registration request validation
const registerSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(60, { message: 'Name cannot exceed 60 characters' }),
  email: z.string()
    .trim()
    .email({ message: 'Invalid email address' })
    .toLowerCase(),
  phone: z.string()
    .trim()
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Schema for login request validation
const loginSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: 'Invalid email address' })
    .toLowerCase(),
  password: z.string()
    .min(1, { message: 'Password is required' })
});

module.exports = {
  registerSchema,
  loginSchema
};
