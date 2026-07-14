import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Eye, EyeOff, UserCheck } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import FormField from '../../components/common/FormField';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().trim().min(1, 'Email address is required').email('Enter a valid email address'),
  phone: z.string().trim().regex(/^\d{10}$/,'Enter a valid 10-digit phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
  terms: z.literal(true, { errorMap: () => ({ message: 'Accept the usage terms to continue' }) }),
}).refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const Register = () => {
  const { register: createAccount, error, clearError, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', terms: false },
  });

  const onSubmit = async (data) => {
  const {
    name,
    email,
    phone,
    password,
    confirmPassword,
  } = data;

  try {
    await createAccount({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });

    navigate('/dashboard', { replace: true });
  } catch (_) {
    // Store exposes the safe API error.
  }
};

  return (
    <section className="auth-stage page-enter">
      <aside className="auth-visual">
        <div className="auth-visual__content">
          <span className="eyebrow" style={{ color: '#91a4ff' }}>Guest access</span>
          <h2>Your dining journey, organised.</h2>
          <p>Create one account to manage reservations, follow your waitlist position and request service during an active visit.</p>
          <div className="auth-signal">
            <div className="auth-signal__row"><span>Reservation history</span><strong>Always available</strong></div>
            <div className="auth-signal__row"><span>Waitlist visibility</span><strong>Live status</strong></div>
            <div className="auth-signal__row"><span>Service requests</span><strong>Linked to your visit</strong></div>
          </div>
        </div>
      </aside>

      <div className="auth-form-pane">
        <div className="auth-card">
          <div className="auth-card__top">
            <span className="eyebrow">Create guest account</span>
            <h1>Join TableFlow</h1>
            <p>Set up your secure profile for reservations, waitlists and dining service.</p>
          </div>

          {error && (
            <div className="auth-error">
              <span><strong>Account creation failed.</strong> {error}</span>
              <button type="button" onClick={clearError}>Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><FormField label="Full name" name="name" placeholder="Mira Patel" error={errors.name} disabled={isLoading} {...register('name')} /></div>
              <div className="sm:col-span-2"><FormField label="Email address" name="email" type="email" placeholder="name@example.com" error={errors.email} disabled={isLoading} {...register('email')} /></div>
              <div className="sm:col-span-2"><FormField label="Phone number" name="phone" type="tel" placeholder="9876543210" error={errors.phone} disabled={isLoading} {...register('phone')} /></div>
              <div className="relative">
                <FormField label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters" error={errors.password} disabled={isLoading} {...register('password')} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <div className="relative">
                <FormField label="Confirm password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat password" error={errors.confirmPassword} disabled={isLoading} {...register('confirmPassword')} />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <label className="sm:col-span-2 flex items-start gap-3 text-[11px] text-slate-500 leading-relaxed cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-[#3657ff]" {...register('terms')} />
                <span>I agree to use TableFlow for legitimate reservation and restaurant-service activity.</span>
              </label>
              {errors.terms && <p className="sm:col-span-2 -mt-2 text-[10px] text-red-600">{errors.terms.message}</p>}
              <button type="submit" disabled={isLoading} className="sm:col-span-2 btn-primary w-full">
                {isLoading ? 'Creating account…' : <><UserCheck size={16} /><span>Create account</span><ArrowRight size={16} /></>}
              </button>
            </div>
          </form>

          <p className="auth-card__footer">Already registered? <Link to="/login" onClick={clearError}>Sign in here</Link></p>
        </div>
      </div>
    </section>
  );
};

export default Register;
