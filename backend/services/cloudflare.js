const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// ---------------------------------------------------------------------------
// R2 client (S3-compatible)
// ---------------------------------------------------------------------------
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || '',
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'combat-girls-media';

/**
 * Upload a buffer to Cloudflare R2.
 * @param {Buffer} buffer  - File contents
 * @param {string} key     - Object key / path (e.g. "avatars/user123.jpg")
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Public URL of the uploaded object
 */
async function uploadToR2(buffer, key, contentType) {
  // TODO: Replace placeholder URL with your R2 public bucket / custom domain URL
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Return the public URL -- adjust domain to your R2 custom domain
    const publicUrl = `https://${BUCKET}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${key}`;
    return publicUrl;
  } catch (err) {
    console.error('R2 upload error:', err);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Delete an object from Cloudflare R2.
 * @param {string} key - Object key to delete
 */
async function deleteFromR2(key) {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  } catch (err) {
    console.error('R2 delete error:', err);
    throw new Error('Failed to delete file from storage');
  }
}

/**
 * Get a direct-upload URL from Cloudflare Stream (TUS protocol).
 * The frontend/client uploads directly to Stream using this URL.
 * @returns {Promise<{uploadUrl: string, videoId: string}>}
 */
async function getStreamUploadUrl() {
  // TODO: Implement actual Cloudflare Stream API call
  // POST https://api.cloudflare.com/client/v4/accounts/{account_id}/stream?direct_upload=true
  // Headers: Authorization: Bearer {CLOUDFLARE_STREAM_API_TOKEN}
  // Body: { maxDurationSeconds: 3600, requireSignedURLs: false }
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_upload=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
          requireSignedURLs: false,
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Stream API error');
    }

    return {
      uploadUrl: data.result.uploadURL,
      videoId: data.result.uid,
    };
  } catch (err) {
    console.error('Stream upload URL error:', err);
    throw new Error('Failed to get stream upload URL');
  }
}

/**
 * Get video details from Cloudflare Stream.
 * @param {string} videoId - Cloudflare Stream video UID
 * @returns {Promise<object>} Video details including playback URLs
 */
async function getStreamVideo(videoId) {
  // TODO: Implement actual Cloudflare Stream API call
  // GET https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{videoId}
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Stream API error');
    }

    return {
      uid: data.result.uid,
      status: data.result.status,
      duration: data.result.duration,
      thumbnail: data.result.thumbnail,
      playback: {
        hls: data.result.playback?.hls,
        dash: data.result.playback?.dash,
      },
    };
  } catch (err) {
    console.error('Stream get video error:', err);
    throw new Error('Failed to get stream video details');
  }
}

module.exports = {
  uploadToR2,
  deleteFromR2,
  getStreamUploadUrl,
  getStreamVideo,
};
