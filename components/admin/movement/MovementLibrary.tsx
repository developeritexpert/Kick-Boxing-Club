'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import './MovementLibrary.css';

type Movement = {
    id: string;
    name: string;
    category: string;
    created_by: string;
    video_url?: string;
    video_provider?: string;
};

const MovementLibrary: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchMovements = async () => {
            try {
                const res = await fetch('/api/admin/movement');
                const data = await res.json();

                if (res.ok && data.success) {
                    setMovements(data.data);
                } else {
                    console.error('Error fetching movements:', data.error);
                }
            } catch (err: unknown) {
                // console.error("Error fetching movements:", err);
                if (err instanceof Error) toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovements();
    }, []);

    const filteredMovements = movements.filter(
        (m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filter === 'All' || m.category === filter),
    );

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this movement?')) return;

        try {
            const res = await fetch(`/api/admin/movement/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                toast.success('Movement deleted!');
                setMovements((prev) => prev.filter((m) => m.id !== id));
                return;
            }

            if (res.status === 409 || data?.code === 'MOVEMENT_IN_USE') {
                toast.error(data.error || 'This movement is already used in a workout and cannot be deleted.');
                return;
            }

            toast.error(data.error || 'Failed to delete movement.');

        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            }
            else {
                toast.error('Something went wrong while deleting movement.');
            }
        }
    };

    return (
        <div className="admin-library-container">
            <div className="library-header">
                <input
                    type="text"
                    placeholder="🔍  Search..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="category-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option>All</option>
                    {Array.from(new Set(movements.map((m) => m.category))).map((category) => (
                        <option key={category}>{category}</option>
                    ))}
                </select>
            </div>

            <div className="table-container">
                {loading ? (
                    <p className="loading">Loading movements...</p>
                ) : (
                    <table className="movement-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Movement Name</th>
                                <th>Category</th>
                                <th>Added By</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovements.length > 0 ? (
                                filteredMovements.map((m, index) => (
                                    <tr key={m.id}>
                                        <td>{index + 1}</td>
                                        <td>{m.name}</td>
                                        <td>{m.category}</td>
                                        <td>{m.created_by}</td>
                                        <td>
                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    router.push(`/admin/movement/${m.id}/edit`)
                                                }
                                            >
                                                Edit
                                            </button>
                                            {/* <button className="edit-btn"> Edit</button> */}

                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(m.id)}
                                            >
                                                Delete
                                            </button>
                                            {/* <button className="delete-btn"> Delete</button> */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center' }}>
                                        No movements found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MovementLibrary;
