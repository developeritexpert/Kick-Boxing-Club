'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import './CreateMovement.css';

const CreateMovement: React.FC = () => {
    const [movementName, setMovementName] = useState('');
    const [category, setCategory] = useState('');
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
            } catch (err) {
                console.error('Error fetching tags:', err);
            }
        };
        fetchCategories();
    }, []);

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
        if (file && file.type.startsWith("video/")) {
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
            toast.error('Please select a video before submitting.')
            return;
        }

        const formData = new FormData();
        formData.append('movementName', movementName);
        formData.append('category', category);

        // if (video) formData.append('video', video);
        // console.log("Form Data :");
        // for (const [key, value] of formData.entries()) {
        //   console.log(key, value);
        // }

        const res = await fetch('/api/admin/movement/create', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error('Something Went wrong')
            console.log('Error from /api/admin/movement/create');
            console.log(data.error);
            return;
        }

        const { uploadURL, video_uid } = data;

        const uploadForm = new FormData();
        uploadForm.append('file', video);

        const uploadRes = await fetch(uploadURL, {
            method: "POST",
            body: uploadForm,
        });

        if (!uploadRes.ok) {
            const text = await uploadRes.text();
            console.error("Cloudflare upload failed:", text);
            toast.error("Video upload failed");
            return;
        }

        // const uploadData = await uploadRes.json();
        // console.log("Cloudflare upload response:", uploadData);

        // if (!uploadRes.ok) {
        //     toast.error('Video upload failed');
        //     return;
        // }

        toast.success('Movement created and video uploaded!');
        setMovementName("");
        setVideo(null);

    };

    return (
        <div className="movement-container">
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

                    <label>Upload Video</label>
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
                        {video && <p className="file-name">{video.name}</p>}
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

