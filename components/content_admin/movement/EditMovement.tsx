'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from './EditMovement.module.css';

type Movement = {
    id: string;
    name: string;
    category: string;
    sub_category: string;
    media_url?: string;
};

const EditMovementPage: React.FC = () => {
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

    // Dropdown states for design
    const [openCategory, setOpenCategory] = useState(false);
    const [openSubCategory, setOpenSubCategory] = useState(false);

    // Get movement data
    useEffect(() => {
        const fetchMovement = async () => {
            try {
                const res = await fetch(`/api/content-admin/movement/${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch movement');

                setMovement(data.movement);
                setName(data.movement.name);
                setCategory(data.movement.category.id || '');
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

    // Get movement categories
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
                const res = await fetch(`/api/content-admin/movement/${id}?upload=true`, {
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

            const updateRes = await fetch(`/api/content-admin/movement/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: finalBody,
            });

            const updateData = await updateRes.json();
            if (!updateRes.ok) throw new Error(updateData.error || 'Failed to update movement');

            toast.success('Movement updated successfully!');
            router.push('/content-admin/movement/library');
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) toast.error(err.message);
            else toast.error('Unknown error occurred');
        } finally {
            setSaving(false);
        }
    };

    // Delete movement
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this movement?')) return;

        try {
            const res = await fetch(`/api/content-admin/movement/${momentId}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Movement deleted!');
                router.push('/content-admin/movement/library');
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

    // if (loading) return <p>Loading movement...</p>;
    if (loading) {
        return (
            <div className={styles.spinnerWrapper}>
                <div className={styles.spinnerLarge}></div>
            </div>
        );
    }

    if (!movement) return <p>Movement not found</p>;

    const selectedTag = tags.find((t) => t.id === category);
    const showSubCategory = selectedTag?.name === 'HIIT';

    const subCategoryOptions = ['Upper Body', 'Lower Body', 'Full Body', 'Core'];

    return (
        <div className={styles.movementLibrarySec}>
            <div className={styles.libraryContainer}>
                <div>
                    <h3 className={styles.hdr}>Edit Movement</h3>
                </div>

                <div className={styles.editMvmbt}>
                    <div className={styles.editMvmntCntnt}>
                        <div className={`${styles.mvmntName} ${styles.catCtn}`}>
                            <label htmlFor="movementName">Movement Name</label>
                            <input
                                type="text"
                                id="movementName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Enter movement name"
                                className={styles.inputField}
                            />
                        </div>

                        <div className={`${styles.category} ${styles.catCtn}`}>
                            <label htmlFor="category">Category</label>
                            <div className={styles.customDropdown}>
                                <button
                                    type="button"
                                    className={`${styles.dropdownBtn} ${openCategory ? styles.active : ''}`}
                                    onClick={() => setOpenCategory(!openCategory)}
                                >
                                    {selectedTag?.name || 'Select category'}
                                </button>

                                {openCategory && (
                                    <ul className={styles.dropdownList}>
                                        {tags.map((tag) => (
                                            <li
                                                key={tag.id}
                                                className={styles.dropdownItem}
                                                onClick={() => {
                                                    setCategory(tag.id);
                                                    if (tag.name !== 'HIIT') setSubCategory('');
                                                    setOpenCategory(false);
                                                }}
                                            >
                                                {tag.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {showSubCategory && (
                        <div className={`${styles.subcategory} ${styles.catCtn}`}>
                            <label htmlFor="subcategory">Sub-category</label>
                            <div className={styles.customDropdown}>
                                <button
                                    type="button"
                                    className={`${styles.dropdownBtn} ${openSubCategory ? styles.active : ''}`}
                                    onClick={() => setOpenSubCategory(!openSubCategory)}
                                >
                                    {subCategory || 'Select sub-category'}
                                </button>

                                {openSubCategory && (
                                    <ul className={styles.dropdownList}>
                                        {subCategoryOptions.map((opt) => (
                                            <li
                                                key={opt}
                                                className={styles.dropdownItem}
                                                onClick={() => {
                                                    setSubCategory(opt);
                                                    setOpenSubCategory(false);
                                                }}
                                            >
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.workoutsVdo}>
                <h2>Upload Photos and Videos</h2>
                <div className={styles.uploadBox}>
                    <input
                        type="file"
                        accept="video/*"
                        id="videoUploads"
                        className={styles.videoUpload}
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="videoUploads"
                        className={styles.uploadLabel}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className={styles.uploadIcon}>
                            <img src="/vdo_upload_icon.png" alt="upload-icon" />
                        </div>
                        <p className={styles.wrkoutVdoPara}>
                            <span className={styles.workVdioBtn}>Select To Upload</span>
                            <span> or drag your video here</span>
                        </p>
                    </label>
                    {media && <p className={styles.fileName}>{media.name}</p>}
                </div>
            </div>

            <div className={styles.mvnmentLibraryBtns}>
                <button
                    type="button"
                    className={`${styles.btnBlack} ${styles.deltBtn}`}
                    onClick={handleDelete}
                >
                    Delete Movement
                </button>
                <button
                    type="button"
                    className={`${styles.btnRed} ${styles.deltBtn}`}
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default EditMovementPage;

// 'use client';

// import React from 'react';
// import styles from './EditMovement.module.css';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// const EditMovementPage: React.FC = () => {
//     const [openMovement, setOpenMovement] = useState(false);
//     const [movementValue, setMovementValue] = useState('jab-cross-combo');
//     const router = useRouter();
//     // Dropdown #2 State
//     const [openCategory, setOpenCategory] = useState(false);
//     const [categoryValue, setCategoryValue] = useState('Boxing');

//     // Dropdown #2 State
//     const [openSubCategory, setOpenSubCategory] = useState(false);
//     const [subCategoryValue, setSubCategoryValue] = useState('Upper Body');

//     const movementOptions = [
//         'jab-cross-combo',
//         'jab-cross-combo2',
//         'jab-cross-combo3',
//         'jab-cross-combo4',
//     ];

//     const categoryOptions = ['Boxing', 'Boxing2', 'Boxing3', 'Boxing4'];
//     const subCategoryOptions = ['Upper Body', 'Upper Body2', 'Upper Body3', 'Upper Body4'];

//     return (
//         <div className={styles.movementLibrarySec}>
//             <div className={styles.libraryContainer}>
//                 <div>
//                     <h3 className={styles.hdr}>Edit Movement</h3>
//                     {/* <button className="add-user-btn" onClick={() => router.push('/content-admin/movement/library')}>
//                     ← Back
//                 </button> */}
//                 </div>

//                 <div className={styles.editMvmbt}>
//                     <div className={styles.editMvmntCntnt}>
//                         <div className={`${styles.mvmntName} ${styles.catCtn}`}>
//                             <label htmlFor="movementName">Movement Name</label>
//                             <div className={styles.customDropdown}>
//                                 <button
//                                     type="button"
//                                     className={`${styles.dropdownBtn} ${openMovement ? styles.active : ''}`}
//                                     onClick={() => setOpenMovement(!openMovement)}
//                                 >
//                                     {movementValue}
//                                 </button>

//                                 {openMovement && (
//                                     <ul className={styles.dropdownList}>
//                                         {movementOptions.map((opt) => (
//                                             <li
//                                                 key={opt}
//                                                 className={styles.dropdownItem}
//                                                 onClick={() => {
//                                                     setMovementValue(opt);
//                                                     setOpenMovement(false);
//                                                 }}
//                                             >
//                                                 {opt}
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}
//                             </div>
//                         </div>

//                         <div className={`${styles.category} ${styles.catCtn}`}>
//                             <label htmlFor="category">Category</label>
//                             <div className={styles.customDropdown}>
//                                 <button
//                                     type="button"
//                                     className={`${styles.dropdownBtn} ${openCategory ? styles.active : ''}`}
//                                     onClick={() => setOpenCategory(!openCategory)}
//                                 >
//                                     {categoryValue}
//                                 </button>

//                                 {openCategory && (
//                                     <ul className={styles.dropdownList}>
//                                         {categoryOptions.map((opt) => (
//                                             <li
//                                                 key={opt}
//                                                 className={styles.dropdownItem}
//                                                 onClick={() => {
//                                                     setCategoryValue(opt);
//                                                     setOpenCategory(false);
//                                                 }}
//                                             >
//                                                 {opt}
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     <div className={`${styles.subcategory} ${styles.catCtn}`}>
//                         <label htmlFor="subcategory">Sub-category</label>
//                         <div className={styles.customDropdown}>
//                             <button
//                                 type="button"
//                                 className={`${styles.dropdownBtn} ${openSubCategory ? styles.active : ''}`}
//                                 onClick={() => setOpenSubCategory(!openSubCategory)}
//                             >
//                                 {subCategoryValue}
//                             </button>

//                             {openSubCategory && (
//                                 <ul className={styles.dropdownList}>
//                                     {subCategoryOptions.map((opt) => (
//                                         <li
//                                             key={opt}
//                                             className={styles.dropdownItem}
//                                             onClick={() => {
//                                                 setSubCategoryValue(opt);
//                                                 setOpenSubCategory(false);
//                                             }}
//                                         >
//                                             {opt}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className={styles.workoutsVdo}>
//                 <h2>Upload Photos and Videos</h2>
//                 <div className={styles.uploadBox}>
//                     <input
//                         type="file"
//                         accept="video/*"
//                         id="videoUploads"
//                         className={styles.videoUpload}
//                     />
//                     <label htmlFor="videoUploads" className={styles.uploadLabel}>
//                         <div className={styles.uploadIcon}>
//                             <img src="/vdo_upload_icon.png" alt="upload-icon" />
//                         </div>
//                         <p className={styles.wrkoutVdoPara}>
//                             <span className={styles.workVdioBtn}>Select To Upload</span>
//                             <span> or drag your video here</span>
//                         </p>
//                     </label>
//                 </div>
//             </div>
//             <div className={styles.mvnmentLibraryBtns}>
//                 <button className={`${styles.btnBlack} ${styles.deltBtn}`}>Delete Movement</button>
//                 <button className={`${styles.btnRed} ${styles.deltBtn}`}>Save Changes</button>
//             </div>
//         </div>
//     );
// };

// export default EditMovementPage;
