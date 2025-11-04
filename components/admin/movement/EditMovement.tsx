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
    const [dragActive, setDragActive] = useState(false);

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
                    console.log(`error fetchMovement `);
                    console.log(err.message);
                } else {
                    toast.error('Unknown error occurred');
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
                const res = await fetch('/api/common/categories');
                const data = await res.json();
                if (data.categories) {
                    setTags(data.categories);
                }
            } catch (err) {
                console.error('Error fetching tags:', err);
            }
        };
        fetchCategories();
    }, []);

    // server side video upload
    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setSaving(true);

    //     try {
    //         const formData = new FormData();
    //         formData.append('name', name);
    //         formData.append('category', category);
    //         formData.append('sub_category', subCategory);
    //         if (media) formData.append('media', media);

    //         const res = await fetch(`/api/admin/movement/${id}`, {
    //             method: 'PUT',
    //             body: formData,
    //         });

    //         const data = await res.json();

    //         if (!res.ok) {
    //             console.error('Server returned error:', data);
    //             throw new Error(data.error || 'Failed to update movement');
    //         }

    //         toast.success('Movement updated successfully!');
    //         router.push('/admin/movement/library');
    //     } catch (err: unknown) {
    //         if (err instanceof Error) {
    //             toast.error(err.message);
    //             console.log(`error handleSubmit `);
    //             console.log(err.message);
    //         } else {
    //             toast.error('Unknown error occurred');
    //         }
    //     } finally {
    //         setSaving(false);
    //     }
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category);
            formData.append('subCategory', subCategory);

            let uploadURL, video_uid;

            if (media) {
                const res = await fetch(`/api/admin/movement/${id}?upload=true`, {
                    method: 'PUT',
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed to create upload URL');

                uploadURL = data.uploadURL;
                video_uid = data.video_uid;

                const uploadForm = new FormData();
                uploadForm.append('file', media);

                const uploadRes = await fetch(uploadURL, {
                    method: 'POST',
                    body: uploadForm,
                });

                if (!uploadRes.ok) throw new Error('Video upload failed');
            }

            const finalBody = JSON.stringify({
                name,
                category,
                subCategory,
                ...(video_uid && {
                    video_id: video_uid,
                    video_url: `https://iframe.videodelivery.net/${video_uid}`,
                    thumbnail_url: `https://videodelivery.net/${video_uid}/thumbnails/thumbnail.jpg`,
                }),
            });

            const updateRes = await fetch(`/api/admin/movement/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: finalBody,
            });

            const updateData = await updateRes.json();
            if (!updateRes.ok) throw new Error(updateData.error || 'Failed to update movement');

            toast.success('Movement updated successfully!');
            router.push('/admin/movement/library');
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) toast.error(err.message);
            else toast.error('Unknown error occurred');
        } finally {
            setSaving(false);
        }
    };

    // delete movement
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this movement?')) return;

        try {
            const res = await fetch(`/api/admin/movement/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                toast.success('Movement deleted!');
                // setMovements((prev) => prev.filter((m) => m.id !== id));
            } else {
                toast.error(data.error || 'Failed to delete movement.');
            }
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMedia(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setMedia(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
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
                            // onChange={(e) => setCategory(e.target.value)}
                            onChange={(e) => {
                                const selected = e.target.value;
                                setCategory(selected);

                                const selectedTag = tags.find((t) => t.id === selected);
                                if (selectedTag?.name !== 'HIIT') setSubCategory('');
                            }}
                        >
                            {tags.length > 0 ? (
                                tags.map((tag) => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name || ''}
                                    </option>
                                ))
                            ) : (
                                <option disabled>Loading...</option>
                            )}
                        </select>
                    </div>

                    {tags.find((t) => t.id === category)?.name === 'HIIT' && (
                        <div className="form-group">
                            <label>Sub-category</label>
                            <select
                                value={subCategory || ''}
                                onChange={(e) => setSubCategory(e.target.value)}
                                required
                            >
                                <option value="">Select sub-category</option>
                                <option value="Upper Body">Upper Body</option>
                                <option value="Lower Body">Lower Body</option>
                                <option value="Full Body">Full Body</option>
                                <option value="Core">Core</option>
                            </select>
                        </div>
                    )}

                    {/* <div className="form-group">
                        <label>Sub-category</label>
                        <input
                            value={subCategory || ''}
                            onChange={(e) => setSubCategory(e.target.value)}
                            required
                            placeholder="Enter sub-category"
                        />
                    </div> */}

                    <div className="form-group full-width">
                        <div className="upload-box">
                            <input
                                type="file"
                                accept="video/*"
                                id="videoUpload"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="videoUpload"
                                className="upload-label"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <div className="upload-icon">⬆️</div>
                                <p>
                                    Select to Upload
                                    <br />
                                    or drag your video here
                                </p>
                            </label>
                            {media && <p className="file-name">{media.name}</p>}
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
