import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Your FastAPI server URL

/**
 * Uploads an audio file to the backend.
 * @param {Blob} audioBlob - The audio file to upload.
 * @returns {Promise} - Response from the backend.
 */
export const uploadAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');

  try {
    const response = await axios.post(`${API_BASE_URL}/upload-audio/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};