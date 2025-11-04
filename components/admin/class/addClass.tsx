'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './addClass.css';

interface ClassData {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const AddClass: React.FC = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [refresh, setRefresh] = useState(false);

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/admin/class');
            const data = await res.json();

            if (res.ok) {
                setClasses(data.data || []);
            } else {
                toast.error(data.error || 'Failed to fetch classes');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching classes');
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [refresh]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/class/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create class');
            }

            toast.success('Class saved successfully');
            setName('');
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error saving class:', error);
            toast.error('Failed to save class');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-class-container">
            <div className="left-section">
                <h2 className="page-title">Add Class</h2>
                <p className="page-subtitle">Fill out the details below to add a class.</p>

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label>Class Name</label>
                        <input
                            name="class_name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter class name"
                        />
                    </div>

                    <div className="form-actions full-width">
                        <button
                            type="button"
                            className="btn cancel"
                            onClick={() => window.history.back()}
                        >
                            Close
                        </button>
                        <button type="submit" className="btn save" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="right-section">
                <h3 className="list-title">Existing Classes</h3>
                <ul className="class-list">
                    {classes.length > 0 ? (
                        classes.map((cls) => (
                            <li key={cls.id} className="class-item">
                                {cls.name}
                            </li>
                        ))
                    ) : (
                        <p className="no-data">No classes found</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AddClass;
