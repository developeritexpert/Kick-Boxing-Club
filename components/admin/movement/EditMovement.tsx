'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import './EditMovement.css';

type Movement = {
    id: string;
    name: string;
    category: {
        id: string;
        name: string;
    };
    sub_category: string;
    media_url?: string;
};

type Category = {
    id: string;
    name: string;
};

type ApiResponse = {
    movement?: Movement;
    error?: string;
};

type UploadResponse = {
    uploadURL?: string;
    video_uid?: string;
    error?: string;
};

export default function EditMovementPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const momentId: string = params.id;

    const [movement, setMovement] = useState<Movement | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

    const [name, setName] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [subCategory, setSubCategory] = useState<string>('');
    const [media, setMedia] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState<boolean>(false);

    const [tags, setTags] = useState<Category[]>([]);

    // Get movement data
    useEffect(() => {
        const fetchMovement = async (): Promise<void> => {
            try {
                setLoading(true);
                const res: Response = await fetch(`/api/admin/movement/${momentId}`);

                if (!res.ok) {
                    throw new Error('Failed to fetch movement');
                }

                const data: ApiResponse = await res.json();

                if (!data.movement) {
                    throw new Error('Movement data not found');
                }

                setMovement(data.movement);
                setName(data.movement.name);
                setCategory(data.movement.category.id);
                setSubCategory(data.movement.sub_category || '');
            } catch (err: unknown) {
                console.error('Error fetching movement:', err);
                if (err instanceof Error) {
                    toast.error(err.message || 'Failed to load movement');
                } else {
                    toast.error('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        if (momentId) {
            fetchMovement();
        }
    }, [momentId]);

    // Get movement categories
    useEffect(() => {
        const fetchCategories = async (): Promise<void> => {
            try {
                setIsLoadingCategories(true);
                const res: Response = await fetch('/api/common/categories');

                if (!res.ok) {
                    throw new Error('Failed to fetch categories');
                }

                const data: { categories?: Category[] } = await res.json();

                if (data.categories && data.categories.length > 0) {
                    setTags(data.categories);
                } else {
                    toast.error('No categories available');
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                toast.error('Failed to load categories. Please refresh the page.');
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Reset sub-category when category changes
    useEffect(() => {
        const selectedTag: Category | undefined = tags.find((t) => t.id === category);
        if (selectedTag?.name !== 'HIIT') {
            setSubCategory('');
        }
    }, [category, tags]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a movement name.');
            return;
        }

        if (!category) {
            toast.error('Please select a category.');
            return;
        }

        const selectedTag: Category | undefined = tags.find((t) => t.id === category);
        if (selectedTag?.name === 'HIIT' && !subCategory) {
            toast.error('Please select a sub-category for HIIT.');
            return;
        }

        setSaving(true);

        try {
            let uploadURL: string | undefined;
            let video_uid: string | undefined;

            // Step 1: If new video is selected, upload it to Cloudflare
            if (media) {
                // Optional: Validate file size
                const maxSize: number = 500 * 1024 * 1024; // 500MB
                if (media.size > maxSize) {
                    toast.error('File size must be less than 500MB');
                    setSaving(false);
                    return;
                }

                const uploadRes: Response = await fetch(
                    `/api/admin/movement/${momentId}?upload=true`,
                    {
                        method: 'PUT',
                    },
                );

                if (!uploadRes.ok) {
                    throw new Error('Failed to create upload URL');
                }

                const uploadData: UploadResponse = await uploadRes.json();

                if (!uploadData.uploadURL || !uploadData.video_uid) {
                    throw new Error('Invalid upload response from server');
                }

                uploadURL = uploadData.uploadURL;
                video_uid = uploadData.video_uid;

                // Upload video to Cloudflare
                const uploadForm: FormData = new FormData();
                uploadForm.append('file', media);

                const cloudflareRes: Response = await fetch(uploadURL, {
                    method: 'POST',
                    body: uploadForm,
                });

                if (!cloudflareRes.ok) {
                    const errorText: string = await cloudflareRes.text();
                    console.error('Cloudflare upload failed:', errorText);
                    throw new Error('Video upload to Cloudflare failed');
                }
            }

            // Step 2: Update movement details
            const updateBody: {
                name: string;
                category: string;
                subCategory: string;
                video_id?: string;
                video_url?: string;
                thumbnail_url?: string;
            } = {
                name: name.trim(),
                category,
                subCategory,
            };

            if (video_uid) {
                updateBody.video_id = video_uid;
                updateBody.video_url = `https://iframe.videodelivery.net/${video_uid}`;
                updateBody.thumbnail_url = `https://videodelivery.net/${video_uid}/thumbnails/thumbnail.jpg`;
            }

            const updateRes: Response = await fetch(`/api/admin/movement/${momentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateBody),
            });

            if (!updateRes.ok) {
                const updateData: { error?: string } = await updateRes.json();
                throw new Error(updateData.error || 'Failed to update movement');
            }

            toast.success('Movement updated successfully!');
            router.push('/admin/movement/library');
        } catch (err: unknown) {
            console.error('Error updating movement:', err);

            if (err instanceof Error) {
                toast.error(err.message || 'Failed to update movement');
            } else {
                toast.error('An unexpected error occurred');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (): Promise<void> => {
        if (!confirm('Are you sure you want to delete this movement?')) {
            return;
        }

        try {
            const res: Response = await fetch(`/api/admin/movement/${momentId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data: { error?: string } = await res.json();
                throw new Error(data.error || 'Failed to delete movement');
            }

            toast.success('Movement deleted successfully!');
            router.push('/admin/movement/library');
        } catch (err: unknown) {
            console.error('Error deleting movement:', err);

            if (err instanceof Error) {
                toast.error(err.message || 'Failed to delete movement');
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files[0]) {
            const file: File = e.target.files[0];

            // Optional: Validate file size
            const maxSize: number = 500 * 1024 * 1024; // 500MB
            if (file.size > maxSize) {
                toast.error('File size must be less than 500MB');
                return;
            }

            setMedia(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file: File | undefined = e.dataTransfer.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('video/')) {
            toast.error('Please upload a video file');
            return;
        }

        // Optional: Validate file size
        const maxSize: number = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            toast.error('File size must be less than 500MB');
            return;
        }

        setMedia(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    if (loading) {
        return (
            <div className="movement-management-container">
                <p>Loading movement...</p>
            </div>
        );
    }

    if (!movement) {
        return (
            <div className="movement-management-container">
                <p>Movement not found</p>
            </div>
        );
    }

    const selectedTag: Category | undefined = tags.find((t) => t.id === category);
    const showSubCategory: boolean = selectedTag?.name === 'HIIT';

    return (
        <div className="movement-management-container">
            <div className="edit-header">
                <h2>Edit Movement</h2>
            </div>

            <form onSubmit={handleSubmit} className="edit-movement-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="movementName">Movement Name</label>
                        <input
                            id="movementName"
                            type="text"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setName(e.target.value)
                            }
                            disabled={saving}
                            required
                            placeholder="Enter movement name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const selected: string = e.target.value;
                                setCategory(selected);
                            }}
                            disabled={saving || isLoadingCategories}
                            required
                        >
                            {isLoadingCategories ? (
                                <option disabled>Loading categories...</option>
                            ) : tags.length > 0 ? (
                                tags.map((tag: Category) => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No categories available</option>
                            )}
                        </select>
                    </div>

                    {showSubCategory && (
                        <div className="form-group">
                            <label htmlFor="subCategory">Sub-category</label>
                            <select
                                id="subCategory"
                                value={subCategory}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setSubCategory(e.target.value)
                                }
                                disabled={saving}
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

                    <div className="form-group full-width">
                        <label htmlFor="videoUpload">Upload New Video (Optional)</label>
                        <div className="upload-box">
                            <input
                                type="file"
                                accept="video/*"
                                id="videoUpload"
                                onChange={handleFileChange}
                                disabled={saving}
                            />
                            <label
                                htmlFor="videoUpload"
                                className={`upload-label ${dragActive ? 'drag-active' : ''} ${
                                    saving ? 'disabled' : ''
                                }`}
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
                            {media && (
                                <p className="file-name">
                                    {media.name} ({(media.size / (1024 * 1024)).toFixed(2)} MB)
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="del-btn"
                        onClick={handleDelete}
                        disabled={saving}
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

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import toast from 'react-hot-toast';
// import './EditMovement.css';

// type Movement = {
//     id: string;
//     name: string;
//     category: string;
//     sub_category: string;
//     media_url?: string;
// };

// export default function EditMovementPage() {
//     const router = useRouter();
//     const { id } = useParams();

//     const params = useParams<{ id: string }>();
//     const momentId = params.id;

//     const [movement, setMovement] = useState<Movement | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);

//     const [name, setName] = useState('');
//     const [category, setCategory] = useState('');
//     const [subCategory, setSubCategory] = useState('');
//     const [media, setMedia] = useState<File | null>(null);
//     const [dragActive, setDragActive] = useState(false);

//     const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

//     // get movement data
//     useEffect(() => {
//         const fetchMovement = async () => {
//             try {
//                 const res = await fetch(`/api/admin/movement/${id}`);
//                 const data = await res.json();
//                 if (!res.ok) throw new Error(data.error || 'Failed to fetch movement');

//                 setMovement(data.movement);
//                 setName(data.movement.name);
//                 setCategory(data.movement.category.id);
//                 setSubCategory(data.movement.sub_category);
//             } catch (err: unknown) {
//                 if (err instanceof Error) {
//                     toast.error(err.message);
//                     console.log(`error fetchMovement `);
//                     console.log(err.message);
//                 } else {
//                     toast.error('Unknown error occurred');
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchMovement();
//     }, [id]);

//     // get movement categories
//     useEffect(() => {
//         const fetchCategories = async () => {
//             try {
//                 const res = await fetch('/api/common/categories');
//                 const data = await res.json();
//                 if (data.categories) {
//                     setTags(data.categories);
//                 }
//             } catch (err) {
//                 console.error('Error fetching tags:', err);
//             }
//         };
//         fetchCategories();
//     }, []);

//     // server side video upload
//     // const handleSubmit = async (e: React.FormEvent) => {
//     //     e.preventDefault();
//     //     setSaving(true);

//     //     try {
//     //         const formData = new FormData();
//     //         formData.append('name', name);
//     //         formData.append('category', category);
//     //         formData.append('sub_category', subCategory);
//     //         if (media) formData.append('media', media);

//     //         const res = await fetch(`/api/admin/movement/${id}`, {
//     //             method: 'PUT',
//     //             body: formData,
//     //         });

//     //         const data = await res.json();

//     //         if (!res.ok) {
//     //             console.error('Server returned error:', data);
//     //             throw new Error(data.error || 'Failed to update movement');
//     //         }

//     //         toast.success('Movement updated successfully!');
//     //         router.push('/admin/movement/library');
//     //     } catch (err: unknown) {
//     //         if (err instanceof Error) {
//     //             toast.error(err.message);
//     //             console.log(`error handleSubmit `);
//     //             console.log(err.message);
//     //         } else {
//     //             toast.error('Unknown error occurred');
//     //         }
//     //     } finally {
//     //         setSaving(false);
//     //     }
//     // };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setSaving(true);

//         try {
//             const formData = new FormData();
//             formData.append('name', name);
//             formData.append('category', category);
//             formData.append('subCategory', subCategory);

//             let uploadURL, video_uid;

//             if (media) {
//                 const res = await fetch(`/api/admin/movement/${id}?upload=true`, {
//                     method: 'PUT',
//                 });
//                 const data = await res.json();

//                 if (!res.ok) throw new Error(data.error || 'Failed to create upload URL');

//                 uploadURL = data.uploadURL;
//                 video_uid = data.video_uid;

//                 const uploadForm = new FormData();
//                 uploadForm.append('file', media);

//                 const uploadRes = await fetch(uploadURL, {
//                     method: 'POST',
//                     body: uploadForm,
//                 });

//                 if (!uploadRes.ok) throw new Error('Video upload failed');
//             }

//             const finalBody = JSON.stringify({
//                 name,
//                 category,
//                 subCategory,
//                 ...(video_uid && {
//                     video_id: video_uid,
//                     video_url: `https://iframe.videodelivery.net/${video_uid}`,
//                     thumbnail_url: `https://videodelivery.net/${video_uid}/thumbnails/thumbnail.jpg`,
//                 }),
//             });

//             const updateRes = await fetch(`/api/admin/movement/${id}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: finalBody,
//             });

//             const updateData = await updateRes.json();
//             if (!updateRes.ok) throw new Error(updateData.error || 'Failed to update movement');

//             toast.success('Movement updated successfully!');
//             router.push('/admin/movement/library');
//         } catch (err: unknown) {
//             console.error(err);
//             if (err instanceof Error) toast.error(err.message);
//             else toast.error('Unknown error occurred');
//         } finally {
//             setSaving(false);
//         }
//     };

//     // delete movement
//     const handleDelete = async (id: string) => {
//         if (!confirm('Are you sure you want to delete this movement?')) return;

//         try {
//             const res = await fetch(`/api/admin/movement/${id}`, { method: 'DELETE' });
//             const data = await res.json();

//             if (res.ok) {
//                 toast.success('Movement deleted!');
//                 router.push('/admin/movement/library');
//                 // setMovements((prev) => prev.filter((m) => m.id !== id));
//             } else {
//                 toast.error(data.error || 'Failed to delete movement.');
//             }
//         } catch (err) {
//             if (err instanceof Error) toast.error(err.message);
//         }
//     };

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setMedia(e.target.files[0]);
//         }
//     };

//     const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);
//         const file = e.dataTransfer.files?.[0];
//         if (file && file.type.startsWith('video/')) {
//             setMedia(file);
//         }
//     };

//     const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(true);
//     };

//     const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);
//     };

//     if (loading) return <p>Loading movement...</p>;
//     if (!movement) return <p>Movement not found</p>;

//     return (
//         <div className="movement-management-container">
//             <div className="edit-header">
//                 <h2>Edit Movement</h2>
//             </div>

//             <form onSubmit={handleSubmit} className="edit-movement-form">
//                 <div className="form-grid">
//                     <div className="form-group">
//                         <label>Movement Name</label>
//                         <input
//                             value={name || ''}
//                             onChange={(e) => setName(e.target.value)}
//                             required
//                             placeholder="Enter movement name"
//                         />
//                     </div>

//                     <div className="form-group">
//                         <label>Category</label>
//                         <select
//                             value={category || ''}
//                             // onChange={(e) => setCategory(e.target.value)}
//                             onChange={(e) => {
//                                 const selected = e.target.value;
//                                 setCategory(selected);

//                                 const selectedTag = tags.find((t) => t.id === selected);
//                                 if (selectedTag?.name !== 'HIIT') setSubCategory('');
//                             }}
//                         >
//                             {tags.length > 0 ? (
//                                 tags.map((tag) => (
//                                     <option key={tag.id} value={tag.id}>
//                                         {tag.name || ''}
//                                     </option>
//                                 ))
//                             ) : (
//                                 <option disabled>Loading...</option>
//                             )}
//                         </select>
//                     </div>

//                     {tags.find((t) => t.id === category)?.name === 'HIIT' && (
//                         <div className="form-group">
//                             <label>Sub-category</label>
//                             <select
//                                 value={subCategory || ''}
//                                 onChange={(e) => setSubCategory(e.target.value)}
//                                 required
//                             >
//                                 <option value="">Select sub-category</option>
//                                 <option value="Upper Body">Upper Body</option>
//                                 <option value="Lower Body">Lower Body</option>
//                                 <option value="Full Body">Full Body</option>
//                                 <option value="Core">Core</option>
//                             </select>
//                         </div>
//                     )}

//                     {/* <div className="form-group">
//                         <label>Sub-category</label>
//                         <input
//                             value={subCategory || ''}
//                             onChange={(e) => setSubCategory(e.target.value)}
//                             required
//                             placeholder="Enter sub-category"
//                         />
//                     </div> */}

//                     <div className="form-group full-width">
//                         <div className="upload-box">
//                             <input
//                                 type="file"
//                                 accept="video/*"
//                                 id="videoUpload"
//                                 onChange={handleFileChange}
//                             />
//                             <label
//                                 htmlFor="videoUpload"
//                                 className="upload-label"
//                                 onDrop={handleDrop}
//                                 onDragOver={handleDragOver}
//                                 onDragLeave={handleDragLeave}
//                             >
//                                 <div className="upload-icon">⬆️</div>
//                                 <p>
//                                     Select to Upload
//                                     <br />
//                                     or drag your video here
//                                 </p>
//                             </label>
//                             {media && <p className="file-name">{media.name}</p>}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="form-actions">
//                     <button
//                         type="button"
//                         className="del-btn"
//                         onClick={() => handleDelete(momentId)}
//                     >
//                         Delete Movement
//                     </button>
//                     <button type="submit" className="save-btn" disabled={saving}>
//                         {saving ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }
