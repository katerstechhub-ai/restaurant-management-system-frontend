import axios from 'axios';
import client from './client';

// Asks our backend for a short-lived signature (admin-only, protects the API secret)
export async function getUploadSignature() {
  const res = await client.get('/uploads/signature');
  return res.data;
}

// Uploads the file straight to Cloudinary — never through our backend.
// Returns the final hosted URL to save on the menu item.
export async function uploadImageToCloudinary(file, onProgress) {
  const { signature, timestamp, folder, apiKey, cloudName } = await getUploadSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const res = await axios.post(uploadUrl, formData, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return res.data.secure_url;
}