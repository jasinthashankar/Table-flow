import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import FormField from '../../components/common/FormField';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email address is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const Login = () => {
  const { login, error, clearError, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      navigate(user.role === 'admin' ? '/admin/dashboard' : from, { replace: true });
    } catch (_) {
      // Store exposes the safe API error.
    }
  };

  return (
    <section className="auth-stage page-enter">
      <aside className="auth-visual">
        <div className="auth-visual__content">
          <span className="eyebrow" style={{ color: '#91a4ff' }}>Secure service workspace</span>
          <h2>Run the room with fewer loose ends.</h2>
          <p>Sign in to coordinate bookings, guest flow and live service activity through one role-aware operations system.</p>
          <div className="auth-signal">
            <div className="auth-signal__row"><span>Session security</span><strong>HTTP-only JWT cookie</strong></div>
            <div className="auth-signal__row"><span>Data layer</span><strong>MongoDB Atlas</strong></div>
            <div className="auth-signal__row"><span>Access model</span><strong>Guest + administrator</strong></div>
          </div>
        </div>
      </aside>

      <div className="auth-form-pane">
        <div className="auth-card">
          <div className="auth-card__top">
            <span className="eyebrow">Welcome back</span>
            <h1>Sign in to TableFlow</h1>
            <p>Use your registered account to continue to the appropriate workspace.</p>
          </div>

          {error && (
            <div className="auth-error">
              <span><strong>Sign-in failed.</strong> {error}</span>
              <button type="button" onClick={clearError}>Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-5">
              <FormField label="Email address" name="email" type="email" placeholder="name@example.com" error={errors.email} disabled={isLoading} {...register('email')} />
              <div className="relative">
                <FormField label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" error={errors.password} disabled={isLoading} {...register('password')} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Signing in…' : <><span>Enter workspace</span><ArrowRight size={16} /></>}
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck size={13} /><span>Your authentication token is never stored in browser storage.</span>
              </div>
            </div>
          </form>

          <p className="auth-card__footer">New to TableFlow? <Link to="/register" onClick={clearError}>Create a guest account</Link></p>
        </div>
      </div>
    </section>
  );
};

export default Login;
