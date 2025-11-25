'use client';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { uploadProfileImage, updateUserProfileImage } from '@/lib/uploadImage';
import styles from './ProfileImageUpload.module.css';

interface ProfileImageUploadProps {
    userId: string;
    currentImageUrl: string | null;
    onImageUpdate: (newImageUrl: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
    userId,
    currentImageUrl,
    onImageUpdate,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsLoading(true);
        const uploadToast = toast.loading('Uploading image...');

        try {
            const imageUrl = await uploadProfileImage(file, userId);

            await updateUserProfileImage(userId, imageUrl);

            onImageUpdate(imageUrl);

            toast.dismiss(uploadToast);
            toast.success('Profile picture updated successfully');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            toast.dismiss(uploadToast);
            toast.error(error instanceof Error ? error.message : 'Failed to upload image');
            console.error('Upload error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.profileImgContainer}>
            <div className={styles.profileImg}>
                <Image
                    src={currentImageUrl || '/profile.png'}
                    alt="profile-img"
                    width={120}
                    height={120}
                    priority
                />
                <button
                    className={styles.profileHeart}
                    onClick={handleCameraClick}
                    disabled={isLoading}
                    aria-label="Upload profile picture"
                >
                    <Image src="/camera_icon.png" alt="camera-icon" width={18} height={14} />
                </button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default ProfileImageUpload;
