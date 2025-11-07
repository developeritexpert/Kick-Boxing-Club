'use client';

import React from 'react';
import styles from './EditMovement.module.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EditMovementPage: React.FC = () => {
    const [openMovement, setOpenMovement] = useState(false);
    const [movementValue, setMovementValue] = useState('jab-cross-combo');
    const router = useRouter();
    // Dropdown #2 State
    const [openCategory, setOpenCategory] = useState(false);
    const [categoryValue, setCategoryValue] = useState('Boxing');

    // Dropdown #2 State
    const [openSubCategory, setOpenSubCategory] = useState(false);
    const [subCategoryValue, setSubCategoryValue] = useState('Upper Body');

    const movementOptions = [
        'jab-cross-combo',
        'jab-cross-combo2',
        'jab-cross-combo3',
        'jab-cross-combo4',
    ];

    const categoryOptions = ['Boxing', 'Boxing2', 'Boxing3', 'Boxing4'];
    const subCategoryOptions = ['Upper Body', 'Upper Body2', 'Upper Body3', 'Upper Body4'];

    return (
        <div className={styles.movementLibrarySec}>
            <div className={styles.libraryContainer}>
                <div>
                    <h3 className={styles.hdr}>Edit Movement</h3>
                    {/* <button className="add-user-btn" onClick={() => router.push('/content-admin/movement/library')}>
                    ← Back
                </button> */}
                </div>

                <div className={styles.editMvmbt}>
                    <div className={styles.editMvmntCntnt}>
                        <div className={`${styles.mvmntName} ${styles.catCtn}`}>
                            <label htmlFor="movementName">Movement Name</label>
                            <div className={styles.customDropdown}>
                                <button
                                    type="button"
                                    className={`${styles.dropdownBtn} ${openMovement ? styles.active : ''}`}
                                    onClick={() => setOpenMovement(!openMovement)}
                                >
                                    {movementValue}
                                </button>

                                {openMovement && (
                                    <ul className={styles.dropdownList}>
                                        {movementOptions.map((opt) => (
                                            <li
                                                key={opt}
                                                className={styles.dropdownItem}
                                                onClick={() => {
                                                    setMovementValue(opt);
                                                    setOpenMovement(false);
                                                }}
                                            >
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className={`${styles.category} ${styles.catCtn}`}>
                            <label htmlFor="category">Category</label>
                            <div className={styles.customDropdown}>
                                <button
                                    type="button"
                                    className={`${styles.dropdownBtn} ${openCategory ? styles.active : ''}`}
                                    onClick={() => setOpenCategory(!openCategory)}
                                >
                                    {categoryValue}
                                </button>

                                {openCategory && (
                                    <ul className={styles.dropdownList}>
                                        {categoryOptions.map((opt) => (
                                            <li
                                                key={opt}
                                                className={styles.dropdownItem}
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
                        </div>
                    </div>

                    <div className={`${styles.subcategory} ${styles.catCtn}`}>
                        <label htmlFor="subcategory">Sub-category</label>
                        <div className={styles.customDropdown}>
                            <button
                                type="button"
                                className={`${styles.dropdownBtn} ${openSubCategory ? styles.active : ''}`}
                                onClick={() => setOpenSubCategory(!openSubCategory)}
                            >
                                {subCategoryValue}
                            </button>

                            {openSubCategory && (
                                <ul className={styles.dropdownList}>
                                    {subCategoryOptions.map((opt) => (
                                        <li
                                            key={opt}
                                            className={styles.dropdownItem}
                                            onClick={() => {
                                                setSubCategoryValue(opt);
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
                    />
                    <label htmlFor="videoUploads" className={styles.uploadLabel}>
                        <div className={styles.uploadIcon}>
                            <img src="/vdo_upload_icon.png" alt="upload-icon" />
                        </div>
                        <p className={styles.wrkoutVdoPara}>
                            <span className={styles.workVdioBtn}>Select To Upload</span>
                            <span> or drag your video here</span>
                        </p>
                    </label>
                </div>
            </div>
            <div className={styles.mvnmentLibraryBtns}>
                <button className={`${styles.btnBlack} ${styles.deltBtn}`}>Delete Movement</button>
                <button className={`${styles.btnRed} ${styles.deltBtn}`}>Save Changes</button>
            </div>
        </div>
    );
};

export default EditMovementPage;
