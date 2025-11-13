'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
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
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

    const selectedTag: { id: string; name: string } | undefined = tags.find((t) => t.id === category);
    const showSubCategory: boolean = selectedTag?.name === 'HIIT';

    return (
        <div className="movement-container">
            <div className="movement-card">
                <h2>Movement Details</h2>
                <form onSubmit={handleSubmit} className="movement-form">
                    <label htmlFor="movementName">Movement Name</label>
                    <input
                        id="movementName"
                        type="text"
                        placeholder="Enter movement name"
                        value={movementName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMovementName(e.target.value)}
                        disabled={isLoading}
                        required
                    />

                    <label htmlFor="category">Category</label>
                    <select 
                        id="category"
                        value={category} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
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
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubCategory(e.target.value)}
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

                    <label htmlFor="videoUpload">Upload Video</label>
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
                            <div className="upload-icon">⬆️</div>
                            <p>
                                Select to Upload
                                <br />
                                or drag your video here
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




















// old code 
// 'use client';

// import React, { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/stores/useAuthStore';
// import './CreateMovement.css';

// const CreateMovement: React.FC = () => {
//     const router = useRouter();
//     const user = useAuthStore((state) => state.user);

//     const [movementName, setMovementName] = useState('');
//     const [category, setCategory] = useState('');
//     const [subCategory, setSubCategory] = useState('');
//     const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
//     const [video, setVideo] = useState<File | null>(null);
//     const [dragActive, setDragActive] = useState(false);

//     useEffect(() => {
//         const fetchCategories = async () => {
//             try {
//                 const res = await fetch('/api/common/categories');
//                 const data = await res.json();
//                 if (data.categories) {
//                     setTags(data.categories);
//                     setCategory(data.categories[0]?.id || '');
//                 }
//             } catch (err) {
//                 console.error('Error fetching tags:', err);
//             }
//         };
//         fetchCategories();
//     }, []);

//     useEffect(() => {
//         const selectedTag = tags.find((t) => t.id === category);
//         if (selectedTag?.name !== 'HIIT') {
//             setSubCategory('');
//         }
//     }, [category]);

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setVideo(e.target.files[0]);
//         }
//     };
//     const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);
//         const file = e.dataTransfer.files?.[0];
//         if (file && file.type.startsWith('video/')) {
//             setVideo(file);
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

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!video) {
//             toast.error('Please select a video before submitting.');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('movementName', movementName);
//         formData.append('category', category);

//         if (user?.id) {
//             formData.append('created_by', user.id);
//         }

//         if (subCategory) formData.append('subCategory', subCategory);

//         // if (video) formData.append('video', video);
//         // console.log("Form Data :");
//         // for (const [key, value] of formData.entries()) {
//         //   console.log(key, value);
//         // }

//         const res = await fetch('/api/admin/movement/create', {
//             method: 'POST',
//             body: formData,
//         });

//         const data = await res.json();

//         if (!res.ok) {
//             toast.error('Something Went wrong');
//             console.log('Error from /api/admin/movement/create');
//             console.log(data.error);
//             return;
//         }

//         // const { uploadURL, video_uid } = data;
//         const { uploadURL } = data;

//         const uploadForm = new FormData();
//         uploadForm.append('file', video);

//         const uploadRes = await fetch(uploadURL, {
//             method: 'POST',
//             body: uploadForm,
//         });

//         if (!uploadRes.ok) {
//             const text = await uploadRes.text();
//             console.error('Cloudflare upload failed:', text);
//             toast.error('Video upload failed');
//             return;
//         }

//         // const uploadData = await uploadRes.json();
//         // console.log("Cloudflare upload response:", uploadData);

//         // if (!uploadRes.ok) {
//         //     toast.error('Video upload failed');
//         //     return;
//         // }

//         toast.success('Movement created and video uploaded!');
//         setMovementName('');
//         setVideo(null);
//         router.push('/admin/movement/library');
//     };

//     return (
//         <div className="movement-container">
//             <div className="movement-card">
//                 <h2>Movement Details</h2>
//                 <form onSubmit={handleSubmit} className="movement-form">
//                     <label>Movement Name</label>
//                     <input
//                         type="text"
//                         placeholder="Enter movement name"
//                         value={movementName}
//                         onChange={(e) => setMovementName(e.target.value)}
//                         required
//                     />

//                     <label>Category</label>
//                     <select value={category} onChange={(e) => setCategory(e.target.value)}>
//                         {tags.length > 0 ? (
//                             tags.map((tag) => (
//                                 <option key={tag.id} value={tag.id}>
//                                     {tag.name}
//                                 </option>
//                             ))
//                         ) : (
//                             <option disabled>Loading...</option>
//                         )}
//                     </select>

//                     {(() => {
//                         const selectedTag = tags.find((t) => t.id === category);
//                         if (selectedTag?.name === 'HIIT') {
//                             return (
//                                 <>
//                                     <label>Sub-category</label>
//                                     <select
//                                         value={subCategory}
//                                         onChange={(e) => setSubCategory(e.target.value)}
//                                         required
//                                     >
//                                         <option value="">Select sub-category</option>
//                                         <option value="Upper Body">Upper Body</option>
//                                         <option value="Lower Body">Lower Body</option>
//                                         <option value="Full Body">Full Body</option>
//                                         <option value="Core">Core</option>
//                                     </select>
//                                 </>
//                             );
//                         }
//                         return null;
//                     })()}

//                     <label>Upload Video</label>
//                     <div className="upload-box">
//                         <input
//                             type="file"
//                             accept="video/*"
//                             id="videoUpload"
//                             onChange={handleFileChange}
//                         />
//                         <label
//                             htmlFor="videoUpload"
//                             className="upload-label"
//                             onDrop={handleDrop}
//                             onDragOver={handleDragOver}
//                             onDragLeave={handleDragLeave}
//                         >
//                             <div className="upload-icon">⬆️</div>
//                             <p>
//                                 Select to Upload
//                                 <br />
//                                 or drag your video here
//                             </p>
//                         </label>
//                         {video && <p className="file-name">{video.name}</p>}
//                     </div>

//                     <button type="submit" className="submit-btn">
//                         Submit
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateMovement;
