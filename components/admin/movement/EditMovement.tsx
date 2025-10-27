'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import './EditMovement.css';

type Movement = {
    id: string;
    name: string;
    category: string;
    sub_category: string;
    media_url?: string;
};

export default function EditMovementPage() {
    const router = useRouter();
    const { id } = useParams();

    const params = useParams<{ id: string }>();
    const momentId = params.id;

    const [movement, setMovement] = useState<Movement | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [media, setMedia] = useState<File | null>(null);

    const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

    // get movement data
    useEffect(() => {
        const fetchMovement = async () => {
            try {
                const res = await fetch(`/api/admin/movement/${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch movement');

                setMovement(data.movement);
                setName(data.movement.name);
                setCategory(data.movement.category.id);
                setSubCategory(data.movement.sub_category);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                    console.log(`error fetching `);
                    console.log(err.message);
                } else {
                    toast.error("Unknown error occurred");
                }

            } finally {
                setLoading(false);
            }
        };
        fetchMovement();
    }, [id]);

    // get movement categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/common/categories");
                const data = await res.json();
                if (data.categories) {
                    setTags(data.categories);
                }
            } catch (err) {
                console.error("Error fetching tags:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // toast('submit function is not complete');
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category);
            formData.append('sub_category', subCategory);
            if (media) formData.append('media', media);

            const res = await fetch(`/api/admin/movement/${id}`, {
                method: 'PUT',
                body: formData,
            });

            const data = await res.json();
            // if (!res.ok) throw new Error(data.error || 'Failed to update movement');

            if (!res.ok) {
                console.error("Server returned error:", data); 
                throw new Error(data.error || 'Failed to update movement');
            }

            toast.success('Movement updated successfully!');
            router.push('/admin/movement/library');
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
                console.log(`error fetching `);
                console.log(err.message);
            }
            else {
                toast.error("Unknown error occurred");
            }
        } finally {
            setSaving(false);
        }
    };

    // delete movement
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this movement?")) return;

        try {
            const res = await fetch(`/api/admin/movement/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok) {
                toast.success("Movement deleted!");
                // setMovements((prev) => prev.filter((m) => m.id !== id));
            } else {
                toast.error(data.error || "Failed to delete movement.");
            }
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
        }
    };

    if (loading) return <p>Loading movement...</p>;
    if (!movement) return <p>Movement not found</p>;

    return (
        <div className="movement-management-container">
            <div className="edit-header">
                <h2>Edit Movement</h2>
            </div>

            <form onSubmit={handleSubmit} className="edit-movement-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Movement Name</label>
                        <input
                            value={name || ''}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter movement name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={category || ''}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {tags.length > 0 ? (
                                tags.map((tag) => (
                                    <option key={tag.id} value={tag.id} >
                                        {tag.name || ''}
                                    </option>
                                ))
                            ) : (
                                <option disabled>Loading...</option>
                            )}
                        </select>
                    </div>


                    <div className="form-group">
                        <label>Sub-category</label>
                        <input
                            value={subCategory || ''}
                            onChange={(e) => setSubCategory(e.target.value)}
                            required
                            placeholder="Enter sub-category"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Upload Photos and Videos</label>
                        <div className="upload-box">
                            <input
                                type="file"
                                onChange={(e) => setMedia(e.target.files?.[0] || null)}
                                accept="image/*,video/*"
                            />
                            <p>{media ? media.name : 'Select file to upload or drag here'}</p>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="del-btn"
                        onClick={() => handleDelete(momentId)}
                    >
                        Delete Movement
                    </button>
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
