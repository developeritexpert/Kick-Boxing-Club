'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import Image from 'next/image';
import './CreateMovement.css';

const CreateMovement: React.FC = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const [movementName, setMovementName] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
    const [video, setVideo] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/common/categories');
                const data = await res.json();
                if (data.categories) {
                    setTags(data.categories);
                    setCategory(data.categories[0]?.id || '');
                }
            } catch (error) {
                console.log(`Error loading categories : ${error} `);
                toast.error('Failed to load Categories');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const selectedTag = tags.find((t) => t.id === category);
        if (selectedTag?.name !== 'HIIT') {
            setSubCategory('');
        }
    }, [category]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideo(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith(`video/`)) {
            setVideo(file);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!video) {
            toast.error('Please select a video before submitting.');
            return;
        }

        const formData = new FormData();
        formData.append('movementName', movementName);
        formData.append('category', category);
        if (user?.id) {
            formData.append('created_by', user.id);
        }
        if (subCategory) formData.append('subCategory', subCategory);

        console.log(`form data`);
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        // api to reserve video container in claudflare
        const res = await fetch('/api/content-admin/movement/create', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error('Something Went wrong');
            console.log('Error from /api/admin/movement/create');
            console.log(data.error);
            return;
        }

        const { uploadURL } = data;

        const uploadForm = new FormData();
        uploadForm.append('file', video);

        const uploadRes = await fetch(uploadURL, {
            method: 'POST',
            body: uploadForm,
        });

        if (!uploadRes.ok) {
            const text = await uploadRes.text();
            console.error('Cloudflare upload failed:', text);
            toast.error('Video upload failed');
            return;
        }

        toast.success('Movement created and video uploaded!');
        setMovementName('');
        setVideo(null);
        router.push('/content-admin/movement/library');
    };

    return (
        <div className="movement-container content-admin-crt-movment">
            <div className="movement-card">
                <h2>Movement Details</h2>
                <form onSubmit={handleSubmit} className="movement-form">
                    <label>Movement Name</label>
                    <input
                        type="text"
                        placeholder="Enter movement name"
                        value={movementName}
                        onChange={(e) => setMovementName(e.target.value)}
                        required
                        maxLength={50}
                    />

                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {tags.length > 0 ? (
                            tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>Loading...</option>
                        )}
                    </select>

                    {(() => {
                        const selectedTag = tags.find((t) => t.id === category);
                        if (selectedTag?.name === 'HIIT') {
                            return (
                                <>
                                    <label>Sub-category</label>
                                    <select
                                        value={subCategory}
                                        onChange={(e) => setSubCategory(e.target.value)}
                                        required
                                    >
                                        <option value="">Select sub-category</option>
                                        <option value="Upper Body">Upper Body</option>
                                        <option value="Lower Body">Lower Body</option>
                                        <option value="Full Body">Full Body</option>
                                        <option value="Core">Core</option>
                                    </select>
                                </>
                            );
                        }
                        return null;
                    })()}

                    {/* <div className="category catCtn">
                        <label htmlFor="category">Category</label>
                        <div className="customDropdown">
                            <button
                                type="button"
                                className={`dropdownBtn ${openCategory ? 'active' : ''}`}
                                onClick={() => setOpenCategory(!openCategory)}
                            >
                                {categoryValue}
                            </button>

                            {openCategory && (
                                <ul className="dropdownList">
                                    {categoryOptions.map((opt) => (
                                        <li
                                            key={opt}
                                            className="dropdownItem"
                                            onClick={() => {
                                                setCategoryValue(opt);
                                                setOpenCategory(false);
                                            }}
                                        >
                                            {opt}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div> */}

                    <div className="workoutsVdo">
                        <h2>Upload Photos and Videos</h2>
                        <div className="uploadBox">
                            <input
                                type="file"
                                accept="video/*"
                                id="videoUploads"
                                className="videoUpload"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="videoUploads"
                                className="uploadLabel"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <div className="uploadIcon">
                                    <Image
                                        src="/vdo_upload_icon.png"
                                        alt="upload-icon"
                                        width={25}
                                        height={26}
                                    />
                                </div>
                                <p className="wrkoutVdoPara">
                                    <span className="workVdioBtn">Select To Upload</span>
                                    <span> or drag your video here</span>
                                </p>
                            </label>
                            {video && <p className="file-name">{video.name}</p>}
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateMovement;
