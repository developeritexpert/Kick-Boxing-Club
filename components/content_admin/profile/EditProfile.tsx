'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import './EditProfile.css';

type UserRole = 'admin' | 'content_admin' | 'instructor';

interface User {
    user_id: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    email: string;
    phone: string;
}

interface UserFormData {
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    phone: string;
}

interface ValidationErrors {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
}

// Validation constants
const VALIDATION = {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 100,
    PHONE_MAX_LENGTH: 10,
    PHONE_MIN_LENGTH: 10,
} as const;

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params?.userId as string;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    const [formData, setFormData] = useState<UserFormData>({
        first_name: '',
        last_name: '',
        email: '',
        role: 'instructor',
        phone: '',
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    // Email validation regex
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhoneNumber = (phone: string): boolean => {
        // Only digits, exactly 10 characters
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    // Validate individual field
    const validateField = (name: keyof ValidationErrors, value: string): string | undefined => {
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
            case 'phone':
                if (!value) {
                    return 'Phone Number is required';
                }
                if (value.length < VALIDATION.PHONE_MIN_LENGTH) {
                    return `Must be at least ${VALIDATION.PHONE_MIN_LENGTH} characters`;
                }
                if (value.length > VALIDATION.PHONE_MAX_LENGTH) {
                    return `Must be at least ${VALIDATION.PHONE_MAX_LENGTH} characters`;
                }
                if (!isValidPhoneNumber(value)) {
                    return 'Must be a correct phone number';
                }
                break;
        }
        return undefined;
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        (Object.keys(formData) as Array<keyof UserFormData>).forEach((key) => {
            if (key !== 'role') {
                const error = validateField(key as keyof ValidationErrors, formData[key]);
                if (error) {
                    newErrors[key as keyof ValidationErrors] = error;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if form has changes
    const checkForChanges = (newData: Partial<UserFormData>): void => {
        if (!user) return;

        const updated = { ...formData, ...newData };
        const changed =
            updated.first_name !== user.first_name ||
            updated.last_name !== user.last_name ||
            updated.email !== user.email ||
            updated.role !== user.role ||
            updated.phone !== user.phone;

        setHasChanges(changed);
    };

    useEffect(() => {
        const fetchUser = async (): Promise<void> => {
            if (!userId) {
                toast.error('Invalid user ID');
                router.push('/content-admin/settings');
                return;
            }

            try {
                // const res = await fetch(`/api/admin/users/${userId}`);
                const res = await fetch(`/api/common/profile/${userId}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to fetch user');
                }

                const userData: User = data.user;
                setUser(userData);
                setFormData({
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    email: userData.email || '',
                    role: userData.role,
                    phone: userData.phone,
                });
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load user';
                toast.error(errorMessage);
                router.push('/content-admin/settings');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        const fieldName = name as keyof UserFormData;

        // Apply max length limits
        let limitedValue = value;
        if (fieldName === 'first_name' || fieldName === 'last_name') {
            limitedValue = value.slice(0, VALIDATION.NAME_MAX_LENGTH);
        } else if (fieldName === 'email') {
            limitedValue = value.slice(0, VALIDATION.EMAIL_MAX_LENGTH);
        } else if (fieldName === 'phone') {
            limitedValue = value.slice(0, VALIDATION.PHONE_MAX_LENGTH);
        }

        const updatedData = { [fieldName]: limitedValue };
        setFormData((prev) => ({ ...prev, ...updatedData }));
        checkForChanges(updatedData);

        // Clear error for this field when user starts typing
        if (errors[fieldName as keyof ValidationErrors]) {
            setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        const error = validateField(name as keyof ValidationErrors, value);

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

        // Check if there are changes
        if (!hasChanges) {
            toast('No changes to save');
            return;
        }

        setSaving(true);

        try {
            // const res = await fetch(`/api/admin/users/${userId}`, {
            const res = await fetch(`/api/common/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            toast.success('User updated successfully!');
            setHasChanges(false);
            // Navigate to users page after short delay
            setTimeout(() => {
                router.push('/content-admin/settings');
            }, 1000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = (): void => {
        router.push('/content-admin/settings');
    };

    // Loading state
    if (loading) {
        return (
            <div className="spinner-wrapper">
                <div className="spinner-large"></div>
            </div>
        );
    }

    // User not found state
    if (!user) {
        return (
            <div className="user-management-container">
                <div className="error-state">
                    <p className="error-message">User not found</p>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => router.push('/content-admin/settings')}
                    >
                        ← Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-management-containr">
            <div className="page-header">
                {/* <h2 className="page-title">Edit User</h2> */}
                {/* <p className="page-subtitle">
                    Update user information for {user.first_name} {user.last_name}
                </p> */}
            </div>

            <form onSubmit={handleSubmit} className="edit-user-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="first_name">
                            First Name <span className="required">*</span>
                        </label>
                        <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            value={formData.first_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={saving}
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
                            value={formData.last_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={saving}
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
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled
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

                    {/* <div className="form-group">
                        <label htmlFor="role">
                            Role <span className="required">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={saving}
                        >
                            <option value="instructor">Instructor</option>
                            <option value="content_admin">Content Admin</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div> */}

                    <div className="form-group">
                        <label htmlFor="phone">
                            Phone Number <span className="required">*</span>
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={saving}
                            maxLength={VALIDATION.PHONE_MAX_LENGTH}
                            placeholder="Enter Phone Number"
                            aria-invalid={!!errors.phone}
                            aria-describedby={errors.phone ? 'phone-error' : undefined}
                        />
                        {errors.phone && (
                            <span id="phone-error" className="error-message">
                                {errors.phone}
                            </span>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn cancel"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        ✕ Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn save"
                        disabled={saving || !hasChanges}
                        title={!hasChanges ? 'No changes to save' : ''}
                    >
                        {saving ? (
                            <>
                                <span className="spinner"></span>
                                Updating...
                            </>
                        ) : (
                            '✓ Update User'
                        )}
                    </button>
                </div>

                {hasChanges && !saving && (
                    <div className="unsaved-changes-notice">
                        <span className="notice-icon"></span>
                        You have unsaved changes, Click update if you want to keep them.
                    </div>
                )}
            </form>
        </div>
    );
}
