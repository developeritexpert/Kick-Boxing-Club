'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';
// import Image from 'next/image';
import styles from './Settings.module.css';

const Settings: React.FC = () => {

    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const router = useRouter();

    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user?.profile_image_url || null);

    useEffect(() => {
        if (user?.profile_image_url) {
            setProfileImageUrl(user.profile_image_url);
        }
    }, [user?.profile_image_url]);


    const capitalizeFirstLetter = (str?: string | null) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleEdit = () => {
        if (user?.id) {
            // alert('working on it');
            router.push(`/instructor/profile-update/${user.id}`);
        } else {
            toast.error('Failed to detect login')
            router.push('/');
        }
    }

    const handleImageUpdate = (newImageUrl: string) => {
        setProfileImageUrl(newImageUrl);

        if (user) {
            setUser({ ...user, profile_image_url: newImageUrl });
        }
    }


    return (
        <div className="instructor-setting-cntner">
            <div className={styles.profileCnt}>
                {/* <div className={styles.profileImg}>
                    <Image src="/profile.png" alt="profile-img" width={120} height={120} />
                    <span className={styles.profileHeart}>
                        <Image src="/camera_icon.png" alt="camera-icon" width={18} height={14} />
                    </span>
                </div>
                <div className={styles.profileName}>
                    <h3>John Doe</h3>
                    <p>Participate</p>
                    <p>Leeds, United Kingdom</p>
                </div> */}

                {user?.id && (
                    <ProfileImageUpload
                        userId={user.id}
                        currentImageUrl={profileImageUrl}
                        onImageUpdate={handleImageUpdate}
                    />
                )}
                <div className={styles.profileName}>
                    <h3>
                        {capitalizeFirstLetter(user?.first_name)} {capitalizeFirstLetter(user?.last_name)}
                    </h3>
                    <p>{capitalizeFirstLetter(user?.role)}</p>
                </div>

            </div>

            <div className={styles.personInfo}>
                <div className={styles.prsnHd}>
                    <h2>Personal Information</h2>
                    <button className={styles.prsnBtn} onClick={handleEdit} >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M11.0581 0.70752C11.269 0.70756 11.4722 0.780529 11.6343 0.912598L11.7017 0.973145L14.1479 3.43115C14.318 3.60205 14.4135 3.83365 14.4136 4.07471C14.4136 4.31572 14.3178 4.54731 14.1479 4.71826L14.147 4.71924L5.48877 13.3687L5.479 13.3794L5.46533 13.3823L2.01123 14.1733L2.00537 14.1753V14.1743C1.94381 14.181 1.88142 14.1806 1.81982 14.1743C1.68464 14.1735 1.55087 14.1434 1.4292 14.0845C1.30769 14.0256 1.20111 13.9399 1.1167 13.8345C1.03218 13.7288 0.971728 13.6049 0.940918 13.4731C0.910225 13.3416 0.909142 13.2047 0.937988 13.0728V13.0718L1.72998 9.65576L1.73291 9.64111L1.74365 9.63135L10.4146 0.973145C10.5855 0.803027 10.8169 0.70752 11.0581 0.70752ZM2.58154 10.1128L1.86572 13.1968L5.01123 12.5376L11.4526 6.12451L9.02393 3.6958L2.58154 10.1128ZM9.65381 3.021L12.0825 5.44971L13.4204 4.07959L11.0317 1.6499L9.65381 3.021Z"
                                fill="white"
                                stroke="white"
                                strokeWidth="0.1"
                            ></path>
                        </svg>
                        <span>Edit</span>
                    </button>
                </div>

                <div className={styles.prflInfoCnt}>
                    <div className={styles.prflName}>
                        <h4>First Name</h4>
                        <h5>{capitalizeFirstLetter(user?.first_name)}</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Last Name</h4>
                        <h5>{capitalizeFirstLetter(user?.last_name)}</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Email Address</h4>
                        <h5>{user?.email}</h5>
                    </div>
                </div>

                <div className={`${styles.prflInfoCnt} ${styles.mrgntp}`}>
                    <div className={styles.prflName}>
                        <h4>Phone Number</h4>
                        <h5>{user?.phone || '---'}</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>User Role</h4>
                        <h5>{capitalizeFirstLetter(user?.role)}</h5>
                    </div>
                    <div className={styles.prflName}>
                        <h4>Date of birth</h4>
                        <h5>---</h5>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
