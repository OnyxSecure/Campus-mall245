'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { fileToBase64 } from '@/lib/utils';
import { User } from '@/lib/types';
import { Upload, BadgeCheck } from 'lucide-react';

export default function SellerRegisterPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', email: '', studentId: '', phone: '', department: '', password: '', confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState('');
  const [studentIdCard, setStudentIdCard] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) setter(await fileToBase64(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!studentIdCard) {
      setError('Student ID card upload is required');
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.registerSeller({ ...form, profilePhoto, studentIdCard });
      setAuth(data.user as User, data.token);
      router.push('/seller/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <BadgeCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary">Become a Verified Seller</h1>
          <p className="mt-2 text-sm text-gray-500">Submit your details for admin verification</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-error">{error}</div>}

          {[
            { label: 'Full Name', field: 'fullName' },
            { label: 'Email Address', field: 'email', type: 'email' },
            { label: 'Student ID', field: 'studentId' },
            { label: 'Phone Number', field: 'phone', type: 'tel' },
            { label: 'Department', field: 'department' },
            { label: 'Password', field: 'password', type: 'password' },
            { label: 'Confirm Password', field: 'confirmPassword', type: 'password' },
          ].map(({ label, field, type = 'text' }) => (
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Profile Photo</label>
              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-primary">
                <Upload className="mb-2 h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-500">{profilePhoto ? 'Photo uploaded' : 'Upload photo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, setProfilePhoto)} />
              </label>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Student ID Card *</label>
              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-primary">
                <Upload className="mb-2 h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-500">{studentIdCard ? 'ID uploaded' : 'Upload ID card'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, setStudentIdCard)} />
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Just want to buy?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">Register as Buyer</Link>
        </p>
      </div>
    </div>
  );
}
