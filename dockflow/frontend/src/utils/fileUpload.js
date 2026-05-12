// Cloudinary file upload utility
export const uploadToCloudinary = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadedFiles = [];
  
  for (const file of files) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('upload_preset', 'dockflow_uploads'); // You need to create this preset in Cloudinary
      
      // Determine resource type
      const resourceType = file.type === 'pdf' ? 'raw' : 'image';
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      uploadedFiles.push({
        file_type: file.type,
        file_url: result.secure_url,
        file_name: file.name,
        public_id: result.public_id
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      // Continue with other files even if one fails
    }
  }
  
  return uploadedFiles;
};

// Fallback when Cloudinary is not configured
export const mockFileUpload = (files) => {
  return files.map(file => ({
    file_type: file.type,
    file_url: `mock://uploads/${file.name}`,
    file_name: file.name,
    public_id: `mock_${Date.now()}_${file.name}`
  }));
};

// Check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!(
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
    import.meta.env.VITE_CLOUDINARY_API_KEY &&
    import.meta.env.VITE_CLOUDINARY_API_SECRET
  );
};
