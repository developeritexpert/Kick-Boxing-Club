'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import './AddUserPage.css';

type UserRole = 'admin' | 'content_admin' | 'instructor';

interface UserForm {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: UserRole;
}

interface ValidationErrors {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
}

// Validation constants
const VALIDATION = {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
} as const;

export default function AddUserPage() {
    const router = useRouter();

    const [form, setForm] = useState<UserForm>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'instructor',
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState<boolean>(false);

    // Email validation regex
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Password strength validation
    const isStrongPassword = (password: string): boolean => {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongPasswordRegex.test(password);
    };

    // Validate individual field
    const validateField = (name: keyof UserForm, value: string): string | undefined => {
        switch (name) {
            case 'first_name':
            case 'last_name':
                if (!value.trim()) {
                    return `${name === 'first_name' ? 'First' : 'Last'} name is required`;
                }
                if (value.trim().length < VALIDATION.NAME_MIN_LENGTH) {
                    return `Must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`;
                }
                if (value.length > VALIDATION.NAME_MAX_LENGTH) {
                    return `Must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`;
                }
                if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    return 'Only letters, spaces, hyphens, and apostrophes allowed';
                }
                break;

            case 'email':
                if (!value.trim()) {
                    return 'Email is required';
                }
                if (value.length > VALIDATION.EMAIL_MAX_LENGTH) {
                    return `Must not exceed ${VALIDATION.EMAIL_MAX_LENGTH} characters`;
                }
                if (!isValidEmail(value)) {
                    return 'Please enter a valid email address';
                }
                break;

            case 'password':
                if (!value) {
                    return 'Password is required';
                }
                if (value.length < VALIDATION.PASSWORD_MIN_LENGTH) {
                    return `Must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
                }
                if (value.length > VALIDATION.PASSWORD_MAX_LENGTH) {
                    return `Must not exceed ${VALIDATION.PASSWORD_MAX_LENGTH} characters`;
                }
                if (!isStrongPassword(value)) {
                    return 'Must contain uppercase, lowercase, and number';
                }
                break;
        }
        return undefined;
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        (Object.keys(form) as Array<keyof UserForm>).forEach((key) => {
            if (key !== 'role') {
                const error = validateField(key, form[key]);
                if (error) {
                    newErrors[key] = error;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        const fieldName = name as keyof UserForm;

        // Apply max length limits
        let limitedValue = value;
        if (fieldName === 'first_name' || fieldName === 'last_name') {
            limitedValue = value.slice(0, VALIDATION.NAME_MAX_LENGTH);
        } else if (fieldName === 'email') {
            limitedValue = value.slice(0, VALIDATION.EMAIL_MAX_LENGTH);
        } else if (fieldName === 'password') {
            limitedValue = value.slice(0, VALIDATION.PASSWORD_MAX_LENGTH);
        }

        setForm((prev) => ({ ...prev, [fieldName]: limitedValue }));

        // Clear error for this field when user starts typing
        if (errors[fieldName as keyof ValidationErrors]) {
            setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        const error = validateField(name as keyof UserForm, value);

        if (error) {
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            toast.error('Please fix all validation errors');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('User created successfully!');
                // Navigate to users page after short delay
                setTimeout(() => {
                    router.push('/admin/users');
                }, 1000);
            } else {
                toast.error(data.error || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = (): void => {
        router.push('/admin/users');
    };

    return (
        <div className="add-user-container">
            <h2 className="page-title">Add New User</h2>
            <p className="page-subtitle">
                Fill out the details below to create a new user account.
            </p>

            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group">
                    <label htmlFor="first_name">
                        First Name <span className="required">*</span>
                    </label>
                    <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        value={form.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading}
                        maxLength={VALIDATION.NAME_MAX_LENGTH}
                        placeholder="Enter first name"
                        aria-invalid={!!errors.first_name}
                        aria-describedby={errors.first_name ? 'first_name-error' : undefined}
                    />
                    {errors.first_name && (
                        <span id="first_name-error" className="error-message">
                            {errors.first_name}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="last_name">
                        Last Name <span className="required">*</span>
                    </label>
                    <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        value={form.last_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading}
                        maxLength={VALIDATION.NAME_MAX_LENGTH}
                        placeholder="Enter last name"
                        aria-invalid={!!errors.last_name}
                        aria-describedby={errors.last_name ? 'last_name-error' : undefined}
                    />
                    {errors.last_name && (
                        <span id="last_name-error" className="error-message">
                            {errors.last_name}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        Email Address <span className="required">*</span>
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading}
                        maxLength={VALIDATION.EMAIL_MAX_LENGTH}
                        placeholder="user@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                        <span id="email-error" className="error-message">
                            {errors.email}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        Password <span className="required">*</span>
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading}
                        maxLength={VALIDATION.PASSWORD_MAX_LENGTH}
                        placeholder="Minimum 8 characters"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    {errors.password && (
                        <span id="password-error" className="error-message">
                            {errors.password}
                        </span>
                    )}
                    <small className="field-hint">
                        Min {VALIDATION.PASSWORD_MIN_LENGTH} characters with uppercase, lowercase &
                        number
                    </small>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="role">
                        Role <span className="required">*</span>
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        disabled={loading}
                    >
                        <option value="instructor">Instructor</option>
                        <option value="content_admin">Content Admin</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="form-actions full-width">
                    <button
                        type="button"
                        className="btn cancel"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        ✕ Cancel
                    </button>
                    <button type="submit" className="btn save" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating...
                            </>
                        ) : (
                            '✓ Save User'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// old code without validations
// 'use client';

// import React, { useState } from 'react';
// import toast from 'react-hot-toast';
// import './AddUserPage.css';

// type UserForm = {
//     first_name: string;
//     last_name: string;
//     email: string;
//     password: string;
//     role: 'admin' | 'content_admin' | 'instructor';
// };

// export default function AddUserPage() {
//     const [form, setForm] = useState<UserForm>({
//         first_name: '',
//         last_name: '',
//         email: '',
//         password: '',
//         role: 'instructor',
//     });

//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setForm((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');

//         const res = await fetch('/api/admin/create-user', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(form),
//         });

//         const data = await res.json();

//         if (res.ok) {
//             toast.success('User created successfully!');
//             setMessage('User created successfully!');
//             setForm({
//                 first_name: '',
//                 last_name: '',
//                 email: '',
//                 password: '',
//                 role: 'instructor',
//             });
//         } else {
//             toast.error(data.error || 'Something went wrong.');
//             setMessage(data.error || 'Something went wrong.');
//         }

//         setLoading(false);
//     };

//     return (
//         <div className="add-user-container">
//             <h2 className="page-title">Add New User</h2>
//             <p className="page-subtitle">
//                 Fill out the details below to create a new user account.
//             </p>

//             <form onSubmit={handleSubmit} className="form-grid">
//                 <div className="form-group">
//                     <label>First Name</label>
//                     <input
//                         name="first_name"
//                         value={form.first_name}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>

//                 <div className="form-group">
//                     <label>Last Name</label>
//                     <input
//                         name="last_name"
//                         value={form.last_name}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>

//                 <div className="form-group">
//                     <label>Email Address</label>
//                     <input
//                         type="email"
//                         name="email"
//                         value={form.email}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>

//                 <div className="form-group">
//                     <label>Password</label>
//                     <input
//                         type="password"
//                         name="password"
//                         value={form.password}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>

//                 <div className="form-group full-width">
//                     <label>Role</label>
//                     <select name="role" value={form.role} onChange={handleChange}>
//                         <option value="admin">Admin</option>
//                         <option value="content_admin">Content Admin</option>
//                         <option value="instructor">Instructor</option>
//                     </select>
//                 </div>

//                 <div className="form-actions full-width">
//                     <button type="button" className="btn cancel" onClick={() => history.back()}>
//                         ✕ Close
//                     </button>
//                     <button type="submit" className="btn save" disabled={loading}>
//                         {loading ? 'Creating...' : 'Save'}
//                     </button>
//                 </div>
//             </form>

//             {message && <p className="message">{message}</p>}
//         </div>
//     );
// }
