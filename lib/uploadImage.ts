import { supabaseClient } from './supabaseClient';

export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        const { data, error: uploadError } = await supabaseClient.storage
            .from('user-profiles')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabaseClient.storage
            .from('user-profiles')
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Image upload error:', error);
        throw new Error('Failed to upload image');
    }
};

export const updateUserProfileImage = async (userId: string, imageUrl: string): Promise<void> => {
    try {
        const { error } = await supabaseClient
            .from('user_meta')
            .update({ profile_image_url: imageUrl })
            .eq('user_id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Database update error:', error);
        throw new Error('Failed to update profile image');
    }
};
