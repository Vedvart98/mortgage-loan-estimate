import { useState, useRef } from 'react';
import { FiUpload, FiFile } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { loanService } from '../../services/loanService';

export default function PDFUploader({ onExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);

    try {
      // Convert PDF to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        
        try {
          const response = await loanService.extractPDF(base64);
          toast.success('PDF extracted successfully!');
          onExtracted(response.data);
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to extract PDF');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to read file');
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Upload Loan Estimate PDF</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />
        
        {!file ? (
          <div>
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF up to 10MB</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 btn btn-primary"
            >
              Select PDF
            </button>
          </div>
        ) : (
          <div>
            <FiFile className="mx-auto h-12 w-12 text-blue-500" />
            <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="mt-4 space-x-2">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Extracting...' : 'Extract Data'}
              </button>
              <button
                onClick={() => setFile(null)}
                className="btn btn-secondary"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
