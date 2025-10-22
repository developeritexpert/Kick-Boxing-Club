'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import './EditUser.css';

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'content_admin' | 'instructor';
  email?: string;
};

export default function EditUserPage() {
  const router = useRouter();
  const { userId } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('instructor');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
        setUser(data.user);
        setFirstName(data.user.first_name);
        setLastName(data.user.last_name);
        setEmail(data.user.email || '');
        setRole(data.user.role);
      } catch (err: unknown) {
        if (err instanceof Error) toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      toast.success('User updated successfully!');
      router.push('/admin/users');
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading user...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="user-management-container">
      {/* <div className="table-header">
        <h2>Edit User</h2>
        <button className="add-user-btn" onClick={() => router.push('/admin/users')}>← Back</button>
      </div> */}

      <form onSubmit={handleSubmit} className="edit-user-form">
        <label>First Name:</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />

        <label>Last Name:</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value as User['role'])}>
          <option value="admin">Admin</option>
          <option value="content_admin">Content Admin</option>
          <option value="instructor">Instructor</option>
        </select>

        <div className="form-actions">
          <button type="button" onClick={() => router.push('/admin/users')}>Cancel</button>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
