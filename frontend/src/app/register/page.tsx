'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/types';

export default function RegisterPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', email: '', studentId: '', phone: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.registerBuyer(form);
      setAuth(data.user as User, data.token);
      router.push('/marketplace');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-secondary">Create Buyer Account</h1>
          <p className="mt-2 text-sm text-gray-500">Start buying safely on campus</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-error">{error}</div>}

          {[
            { label: 'Full Name', field: 'fullName', type: 'text' },
            { label: 'Email Address', field: 'email', type: 'email' },
            { label: 'Student ID', field: 'studentId', type: 'text' },
            { label: 'Phone Number', field: 'phone', type: 'tel' },
            { label: 'Password', field: 'password', type: 'password' },
            { label: 'Confirm Password', field: 'confirmPassword', type: 'password' },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-medium">{label}</label>
              <input
                type={type}
                className="input-field"
                value={form[field as keyof typeof form]}
                onChange={(e) => update(field, e.target.value)}
                required
              />
            </div>
          ))}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Want to sell?{' '}
          <Link href="/register/seller" className="font-semibold text-primary hover:underline">Register as Seller</Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
