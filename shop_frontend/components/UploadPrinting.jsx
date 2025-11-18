import React, { useState, useRef } from "react";
import { SERVER_URI } from "../uri/uril";


const UploadPrinting = () => {
  const [thumbnails, setThumbnails] = useState([]); // URLs for preview
  const [files, setFiles] = useState([]); // Actual File objects
  const [tableData, setTableData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Handle selected files
  const handleFiles = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).slice(0, 10 - files.length); // max 10 files
    const newThumbs = newFiles.map((file) => URL.createObjectURL(file));

    setThumbnails((prev) => [...prev, ...newThumbs]);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Drag & Drop handlers
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // Upload function
  const handleUploadPrinting = async () => {
    if (files.length === 0) {
      console.error("No files to upload");
      return;
    }

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const res = await fetch( `${SERVER_URI}/uploadPrint`, {
        method: "POST",
        body: formData,
        credentials: "include", // sends HttpOnly cookies automatically
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const responseData = await res.json();
      console.log("Server response:", responseData);
      setTableData(responseData.results || []);

      // Reset after upload
      setThumbnails([]);
      setFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="flex flex-wrap justify-center items-start min-h-screen bg-gray-100 p-6 gap-8">
      {/* Upload Section */}
      <form
        className="w-full md:w-[45%] bg-white shadow-md rounded-lg p-6"
        onSubmit={(e) => e.preventDefault()}
        encType="multipart/form-data"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <label
          htmlFor="fileInput"
          className={`w-full min-h-[250px] border-2 border-dashed rounded-md flex flex-col justify-center items-center cursor-pointer transition-colors duration-300 ${
            isDragging ? "bg-gray-200 border-black" : "bg-white border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {thumbnails.length === 0 ? (
            <span className="text-gray-700 text-lg font-medium">
              Drag & Drop or Click to Upload Printing
            </span>
          ) : (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {thumbnails.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`preview-${index}`}
                  className="w-24 h-24 object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </label>

        <button
          type="button"
          onClick={handleUploadPrinting}
          className="mt-6 w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Upload
        </button>
      </form>

      {/* Table Section */}
      <div className="w-full md:w-[45%] bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">All Printings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-center text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="py-2 px-3 border">No.</th>
                <th className="py-2 px-3 border">Size</th>
                <th className="py-2 px-3 border">Square Feet</th>
                <th className="py-2 px-3 border">Quantity</th>
                <th className="py-2 px-3 border">Sheet</th>
                <th className="py-2 px-3 border">Price</th>
                <th className="py-2 px-3 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((item, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                  >
                    <td className="py-2 px-3 border">{index + 1}</td>
                    <td className="py-2 px-3 border">{item.size}</td>
                    <td className="py-2 px-3 border">{item.squareFeet}</td>
                    <td className="py-2 px-3 border">{item.quantity}</td>
                    <td className="py-2 px-3 border">{item.sheet}</td>
                    <td className="py-2 px-3 border">{item.price}</td>
                    <td className="py-2 px-3 border">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-gray-500 py-3 border text-center"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UploadPrinting;
