'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './AddUserPage.css'; // Make sure you import the CSS

type UserForm = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'admin' | 'content_admin' | 'instructor';
};

export default function AddUserPage() {
  const [form, setForm] = useState<UserForm>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'instructor',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success('User created successfully!');
      setMessage('User created successfully!');
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'instructor',
      });
    } else {
      toast.error(data.error || 'Something went wrong.');
      setMessage(data.error || 'Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <div className="add-user-container">
      <h2 className="page-title">Add New User</h2>
      <p className="page-subtitle">
        Fill out the details below to create a new user account.
      </p>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="content_admin">Content Admin</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        <div className="form-actions full-width">
          <button
            type="button"
            className="btn cancel"
            onClick={() => history.back()}
          >
            ✕ Close
          </button>
          <button type="submit" className="btn save" disabled={loading}>
            {loading ? 'Creating...' : 'Save'}
          </button>
        </div>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
