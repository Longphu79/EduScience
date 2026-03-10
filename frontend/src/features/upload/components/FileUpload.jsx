import { useState, useRef } from "react";

const FileUpload = ({ accept, label, onUpload, preview: previewUrl }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(previewUrl || null);
  const inputRef = useRef(null);

  const isVideo = accept?.includes("video");

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setLoading(true);
    try {
      const result = await onUpload(file);
      setPreview(result.url);
    } catch (err) {
      alert(err.message || "Upload failed");
      setPreview(previewUrl || null);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {preview && (
        <div className="mb-2">
          {isVideo ? (
            <video src={preview} controls className="max-w-xs rounded" />
          ) : (
            <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded" />
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={loading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 disabled:opacity-50"
      />

      {loading && <p className="text-sm text-gray-500">Uploading...</p>}
    </div>
  );
};

export default FileUpload;
