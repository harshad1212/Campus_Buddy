const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

/**
 * Upload multiple files to the backend.
 * @param {Array} files - Array of { file, url, type } objects from MessageInput
 * @param {string} token - User auth token
 * @param {function} onProgress - Optional callback: ({ name, progress }) => void
 * @returns {Promise<Array>} - Array of uploaded file info from backend
 */
export const uploadFiles = async (files, token, onProgress) => {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f.file));

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/upload`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const total = event.total;
        const loaded = event.loaded;
        const progress = Math.round((loaded / total) * 100);
        files.forEach((f) => onProgress({ name: f.file.name, progress }));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response); // backend returns array of uploaded file info
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.send(formData);
  });
};
