'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import './CreateMovement.css';
import Image from 'next/image';

const CreateMovement: React.FC = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const [movementName, setMovementName] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
    const [video, setVideo] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    // const [defaultPlaybackSeconds, setDefaultPlaybackSeconds] = useState('');


    useEffect(() => {
        const fetchCategories = async (): Promise<void> => {
            try {
                setIsLoadingCategories(true);
                const res: Response = await fetch('/api/common/categories');

                if (!res.ok) {
                    throw new Error('Failed to fetch categories');
                }

                const data: { categories?: { id: string; name: string }[] } = await res.json();

                if (data.categories && data.categories.length > 0) {
                    setTags(data.categories);
                    setCategory(data.categories[0]?.id || '');
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

    useEffect(() => {
        const selectedTag = tags.find((t) => t.id === category);
        if (selectedTag?.name !== 'HIIT') {
            setSubCategory('');
        }
    }, [category, tags]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files[0]) {
            const file: File = e.target.files[0];

            const maxSize: number = 500 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('File size must be less than 500MB');
                return;
            }

            setVideo(file);
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

        const maxSize: number = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size must be less than 500MB');
            return;
        }

        setVideo(file);
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (movementName.length > 50) {
            toast.error(`Movement Name Must not exceed 50 characters`);
            return;
        }
        if (!video) {
            toast.error('Please select a video before submitting.');
            return;
        }

        if (!movementName.trim()) {
            toast.error('Please enter a movement name.');
            return;
        }

        if (!category) {
            toast.error('Please select a category.');
            return;
        }

        // if(
        //     defaultPlaybackSeconds !== '' &&
        //     Number(defaultPlaybackSeconds) <= 0
        // ) {
        //     toast.error('Default playback seconds must be greater than 0');
        //     return;
        // }

        const selectedTag = tags.find((t) => t.id === category);
        if (selectedTag?.name === 'HIIT' && !subCategory) {
            toast.error('Please select a sub-category for HIIT.');
            return;
        }

        setIsLoading(true);

        try {
            const formData: FormData = new FormData();
            formData.append('movementName', movementName.trim());
            formData.append('category', category);

            if (user?.id) {
                formData.append('created_by', user.id);
            }

            if (subCategory) {
                formData.append('subCategory', subCategory);
            }

            // if (defaultPlaybackSeconds !== '') {
            //     formData.append(
            //         'default_playback_seconds',
            //         defaultPlaybackSeconds,
            //     );
            // }

            const res: Response = await fetch('/api/admin/movement/create', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data: { error?: string } = await res.json();
                throw new Error(data.error || 'Failed to create movement');
            }

            const data: { uploadURL?: string } = await res.json();
            const { uploadURL } = data;

            if (!uploadURL) {
                throw new Error('No upload URL received from server');
            }

            const uploadForm: FormData = new FormData();
            uploadForm.append('file', video);

            const uploadRes: Response = await fetch(uploadURL, {
                method: 'POST',
                body: uploadForm,
            });

            if (!uploadRes.ok) {
                const errorText: string = await uploadRes.text();
                console.error('Cloudflare upload failed:', errorText);
                throw new Error('Video upload to Cloudflare failed');
            }

            toast.success('Movement created and video uploaded successfully!');

            setMovementName('');
            setVideo(null);
            setSubCategory('');
            // setDefaultPlaybackSeconds('');

            router.push('/admin/movement/library');
        } catch (err) {
            console.error('Error creating movement:', err);

            if (err instanceof Error) {
                toast.error(err.message || 'Something went wrong');
            } else {
                toast.error('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const selectedTag: { id: string; name: string } | undefined = tags.find(
        (t) => t.id === category,
    );
    const showSubCategory: boolean = selectedTag?.name === 'HIIT';


    //  <label htmlFor="PlaybackSeconds">
    //     Playback Seconds
    // </label>
    // <input
    //     id="PlaybackSeconds"
    //     type="number"
    //     placeholder="e.g. 30"
    //     value={defaultPlaybackSeconds}
    //     onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    //         const value = e.target.value;
    //         if (value === "") {
    //             setDefaultPlaybackSeconds("");
    //             return;
    //         }
    //         const num = Number(value);
    //         if (num > 600) {
    //             setDefaultPlaybackSeconds('600');
    //             return;
    //         }
    //         setDefaultPlaybackSeconds(String(num));
    //     }}
    //     onKeyDown={(e) => {
    //         if (["e", "E", "+", "-", "."].includes(e.key)) {
    //             e.preventDefault();
    //         }
    //     }}
    //     min="0"
    //     max="600"
    //     required
    //     disabled={isLoading}
    // />

    return (
        <div className="movement-container admin-crt-movment">
            <div className="movement-card">
                <h2>Movement Details</h2>
                <form onSubmit={handleSubmit} className="movement-form">
                    <label htmlFor="movementName">Movement Name</label>
                    <input
                        id="movementName"
                        type="text"
                        placeholder="Enter movement name"
                        value={movementName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setMovementName(e.target.value)
                        }
                        disabled={isLoading}
                        required
                        maxLength={50}
                    />

                   

                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setCategory(e.target.value)
                        }
                        disabled={isLoading || isLoadingCategories}
                        required
                    >
                        {isLoadingCategories ? (
                            <option disabled>Loading categories...</option>
                        ) : tags.length > 0 ? (
                            tags.map((tag: { id: string; name: string }) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>No categories available</option>
                        )}
                    </select>

                    {showSubCategory && (
                        <>
                            <label htmlFor="subCategory">Sub-category</label>
                            <select
                                id="subCategory"
                                value={subCategory}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setSubCategory(e.target.value)
                                }
                                disabled={isLoading}
                                required
                            >
                                <option value="">Select sub-category</option>
                                <option value="Upper Body">Upper Body</option>
                                <option value="Lower Body">Lower Body</option>
                                <option value="Full Body">Full Body</option>
                                <option value="Core">Core</option>
                            </select>
                        </>
                    )}

                    <label htmlFor="videoUpload" className="upld-video">
                        Upload Video
                    </label>
                    <div className="upload-box">
                        <input
                            type="file"
                            accept="video/*"
                            id="videoUpload"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                        <label
                            htmlFor="videoUpload"
                            className={`upload-label ${dragActive ? 'drag-active' : ''} ${isLoading ? 'disabled' : ''}`}
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
                        {video && (
                            <p className="file-name">
                                {video.name} ({(video.size / (1024 * 1024)).toFixed(2)} MB)
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading || isLoadingCategories}
                    >
                        {isLoading ? 'Saving...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateMovement;