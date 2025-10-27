'use client';

import React, { useEffect, useState } from 'react';
import './CreateMovement.css';

const CreateMovement: React.FC = () => {
    const [movementName, setMovementName] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
    const [video, setVideo] = useState<File | null>(null);

    // Fetch categories (tags) from API
    // useEffect(() => {
    //   const fetchTags = async () => {
    //     try {
    //       const res = await fetch("/api/common/tags");
    //       const data = await res.json();
    //       if (data.tags) {
    //         setTags(data.tags);
    //         setCategory(data.tags[0]?.id || "");
    //       }
    //     } catch (err) {
    //       console.error("Error fetching tags:", err);
    //     }
    //   };
    //   fetchTags();
    // }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('movementName', movementName);
        formData.append('category', category);
        if (video) formData.append('video', video);

        //way to read formData as consolde.log did not work
        // console.log("Form Data Preview:");
        // for (const [key, value] of formData.entries()) {
        //   console.log(key, value);
        // }

        const res = await fetch('/api/admin/movement/create', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            alert('Movement saved successfully!');
            setMovementName('');
            setVideo(null);
        } else {
            alert('Error: ' + data.error);
        }
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
                        <label htmlFor="videoUpload" className="upload-label">
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

// "use client";

// import React, { useState } from "react";
// import "./CreateMovement.css";

// const CreateMovement: React.FC = () => {
//   const [movementName, setMovementName] = useState("");
//   const [category, setCategory] = useState("Upper body");
//   const [video, setVideo] = useState<File | null>(null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setVideo(e.target.files[0]);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log({ movementName, category, video });
//     alert("Movement submitted!");
//   };

//   return (
//     <div className="movement-container">
//       <div className="movement-card">
//         <h2>Movement Details</h2>
//         <form onSubmit={handleSubmit} className="movement-form">
//           <label>Movement Name</label>
//           <input
//             type="text"
//             placeholder="Enter movement name"
//             value={movementName}
//             onChange={(e) => setMovementName(e.target.value)}
//             required
//           />

//           <label>Category</label>
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//           >
//             <option>Upper body</option>
//             <option>Lower body</option>
//             <option>Cardio</option>
//             <option>Full body</option>
//           </select>

//           <label>Upload Videos</label>
//           <div className="upload-box">
//             <input
//               type="file"
//               accept="video/*"
//               id="videoUpload"
//               onChange={handleFileChange}
//             />
//             <label htmlFor="videoUpload" className="upload-label">
//               <div className="upload-icon">⬆️</div>
//               <p>Select to Upload<br />or drag your video here</p>
//             </label>
//             {video && <p className="file-name">{video.name}</p>}
//           </div>

//           <button type="submit" className="submit-btn">
//             Submit
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateMovement;
