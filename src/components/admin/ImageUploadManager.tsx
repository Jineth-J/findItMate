import React, { useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { uploadAPI } from '../../services/api';
interface UploadedImage {
  id: string;
  name: string;
  size: string;
  date: string;
  url: string;
}
const MOCK_UPLOADS: UploadedImage[] = [
  {
    id: '1',
    name: 'property-main.jpg',
    size: '2.4 MB',
    date: 'Just now',
    url: '/uploads/default-property.png'
  },
  {
    id: '2',
    name: 'room-view.jpg',
    size: '1.8 MB',
    date: '2 mins ago',
    url: '/uploads/default-property.png'
  },
  {
    id: '3',
    name: 'bathroom.jpg',
    size: '3.1 MB',
    date: '5 mins ago',
    url: '/uploads/default-property.png'
  }];

export function ImageUploadManager() {
  const [uploads, setUploads] = useState<UploadedImage[]>(MOCK_UPLOADS);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleOpenFolder = () => {
    alert('Opening local upload directory: /var/www/uploads/images');
  };
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      setUploads((prev) => prev.filter((img) => img.id !== id));
    }
  };
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      try {
        const files = Array.from(e.target.files);
        // Using uploadMultiple or loop single uploads
        // Let's use uploadMultiple since we added it
        const response = await uploadAPI.uploadMultiple(files);

        if (response && response.data) {
          const newUploads = response.data.map((file: any) => ({
            id: file.filename, // or unique ID
            name: file.originalname,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            date: 'Just now',
            url: file.url // Backend returns /uploads/filename
          }));
          setUploads((prev) => [...newUploads, ...prev]);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload images');
      } finally {
        setUploading(false);
      }
    }
  };
  return (
    <div className="bg-[#161616] border border-[#333] rounded-xl overflow-hidden mt-6">
      <div className="p-6 border-b border-[#333] flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-red-500" />
          Upload Manager
        </h3>
        <button
          onClick={handleOpenFolder}
          className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors bg-[#222] px-3 py-1.5 rounded-lg border border-[#333]">

          <FolderOpen className="w-3 h-3" />
          Open Folder
        </button>
      </div>

      <div className="p-6">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer mb-6 ${isDragging ? 'border-red-500 bg-red-900/10' : 'border-[#333] bg-[#0f0f0f] hover:border-[#555] hover:bg-[#1a1a1a]'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            // Handle drop logic here
            alert('Files dropped! (Simulation)');
          }}
          onClick={() => fileInputRef.current?.click()}>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileSelect} />

          <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center mb-3 text-gray-400">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-white font-medium mb-1">
            Click to upload or drag and drop
          </h4>
          <p className="text-xs text-gray-500">
            {uploading ? 'Uploading...' : 'SVG, PNG, JPG or GIF (max. 5MB)'}
          </p>
        </div>

        {/* Recent Uploads Grid */}
        <h4 className="text-sm font-bold text-white mb-4">Recent Uploads</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {uploads.map((img) =>
            <div
              key={img.id}
              className="group relative bg-[#0f0f0f] border border-[#333] rounded-lg overflow-hidden aspect-square">

              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />


              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-xs text-white font-medium truncate">
                  {img.name}
                </p>
                <p className="text-[10px] text-gray-400">{img.size}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(img.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">

                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Add New Placeholder */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border border-[#333] border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-gray-500 hover:bg-[#1a1a1a] transition-all aspect-square">

            <Upload className="w-5 h-5" />
            <span className="text-xs">Add New</span>
          </button>
        </div>
      </div>
    </div>);

}