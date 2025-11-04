const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const baseUrl =
    process.env.CLOUDFLARE_STREAM_BASE_URL || 'https://api.cloudflare.com/client/v4/accounts';

if (!accountId || !apiToken) {
    throw new Error(
        ' Missing Cloudflare credentials. Please check .env.local for CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.',
    );
}

export const CLOUDFLARE = {
    accountId,
    apiToken,
    baseUrl,

    // upload video to cloudflare
    async createDirectUpload(maxDurationSeconds: number = 600) {
        const response = await fetch(`${baseUrl}/${accountId}/stream/direct_upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ maxDurationSeconds }),
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Cloudflare direct upload creation failed:', data);
            throw new Error('Failed to create direct upload URL');
        }

        return data.result;
    },

    // get video data by UID.
    async getVideoDetails(videoUID: string) {
        const response = await fetch(`${baseUrl}/${accountId}/stream/${videoUID}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        const data = await response.json();
        if (!data.success) {
            console.error('Failed to fetch video details:', data);
            throw new Error('Error fetching Cloudflare video details');
        }

        return data.result;
    },

    // delete based on video uid of cloudflafe or video_id of supabase
    async deleteVideoFromCloudflare(videoId: string) {
        if (!videoId) return;

        await fetch(`${baseUrl}/${accountId}/stream/${videoId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${apiToken}` },
        });
    },
};
