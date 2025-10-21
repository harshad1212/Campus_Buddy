import React, { useState } from "react";
import PropTypes from "prop-types";
import { FiDownload } from "react-icons/fi";
import { FileText, Image, Video, FileSpreadsheet, File } from "lucide-react";

const AttachmentPreview = ({ file, isOwn, progress = 0 }) => {
  const [downloaded, setDownloaded] = useState(false);
  if (!file) return null;

  // --- File Download Handler ---
  const handleDownload = async () => {
    try {
      console.log("Initiating download for:", file);

      let mimeType = "application/octet-stream";
      let extension = "";
      switch (file.type) {
        case "pdf":
          mimeType = "application/pdf";
          extension = ".pdf";
          break;
        case "word":
          mimeType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          extension = ".docx";
          break;
        case "excel":
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          extension = ".xlsx";
          break;
        case "image":
          mimeType = "image/jpeg";
          extension = ".jpg";
          break;
        case "video":
          mimeType = "video/mp4";
          extension = ".mp4";
          break;
        default:
          mimeType = "application/octet-stream";
          extension = "";
      }

      const urlParts = file.url.split("/");
      const lastSegment = urlParts[urlParts.length - 1];
      const baseName = lastSegment.replace(/^\d+_/, "");
      const safeFileName = decodeURIComponent(baseName);

      const response = await fetch(file.url);
      if (!response.ok) throw new Error("Failed to fetch file data");

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: mimeType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeFileName.endsWith(extension)
        ? safeFileName
        : `${safeFileName}${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloaded(true);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file.");
    }
  };

  // --- Detect file type ---
  const getFileType = () => {
    const url = file.url || "";
    const type = file.type || "";
    if (type.startsWith("image/") || url.includes("/image/upload/")) return "image";
    if (type.startsWith("video/") || url.includes("/video/upload/")) return "video";
    if (type === "application/pdf" || url.endsWith(".pdf")) return "pdf";
    if (type.includes("word") || url.endsWith(".docx")) return "word";
    if (type.includes("excel") || url.endsWith(".xlsx")) return "excel";
    return "other";
  };

  const fileType = getFileType();

  // --- Upload Progress Overlay ---
  const renderProgressOverlay = () => {
    if (!isOwn || progress <= 0 || progress >= 100) return null;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * progress) / 100;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg z-10 backdrop-blur-sm">
        <svg className="w-12 h-12 rotate-[-90deg]">
          <circle
            strokeWidth="4"
            stroke="rgba(255,255,255,0.3)"
            fill="transparent"
            r={radius}
            cx="24"
            cy="24"
          />
          <circle
            strokeWidth="4"
            stroke="#3b82f6"
            fill="transparent"
            r={radius}
            cx="24"
            cy="24"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.2s ease" }}
          />
        </svg>
        <span className="absolute text-white text-sm font-medium">{progress}%</span>
      </div>
    );
  };

  // --- Icons by file type ---
  const renderFileIcon = () => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-6 h-6 text-red-500" />;
      case "word":
        return <FileText className="w-6 h-6 text-blue-500" />;
      case "excel":
        return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
      case "image":
        return <Image className="w-6 h-6 text-purple-500" />;
      case "video":
        return <Video className="w-6 h-6 text-pink-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  // --- Image Preview ---
  if (fileType === "image") {
    return (
      <div className="relative inline-block max-w-xs rounded-xl overflow-hidden shadow-md border border-gray-200 group hover:shadow-lg transition">
        <img
          src={file.url}
          alt={file.filename || "image"}
          className="w-full h-48 object-cover rounded-xl"
        />
        {renderProgressOverlay()}
        {!isOwn && !downloaded && (
          <button
            onClick={handleDownload}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 backdrop-blur-sm rounded-xl z-20"
            title="Download"
          >
            <FiDownload className="text-white w-7 h-7" />
          </button>
        )}
      </div>
    );
  }

  // --- Video Preview ---
  if (fileType === "video") {
    return (
      <div className="relative max-w-xs rounded-xl overflow-hidden shadow-md border border-gray-200 group hover:shadow-lg transition">
        <video src={file.url} controls className="w-full h-48 object-cover rounded-xl" />
        {renderProgressOverlay()}
        {!isOwn && !downloaded && (
          <button
            onClick={handleDownload}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 backdrop-blur-sm rounded-xl z-20"
            title="Download"
          >
            <FiDownload className="text-white w-7 h-7" />
          </button>
        )}
      </div>
    );
  }

  // --- Document / Other File Preview ---
  return (
    <div className="relative flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition max-w-xs group">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
        {renderFileIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-800 truncate">
          {file.filename || "file"}
        </span>
        {file.size && (
          <span className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>

      {renderProgressOverlay()}
      {!isOwn && !downloaded && (
        <button
          onClick={handleDownload}
          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-blue-600 transition z-20"
          title="Download"
        >
          <FiDownload className="w-5 h-5" />
        </button>
      )}

      {downloaded && (
        <span className="absolute top-1 right-2 text-xs text-green-500 font-medium">
          Downloaded
        </span>
      )}
    </div>
  );
};

AttachmentPreview.propTypes = {
  file: PropTypes.shape({
    url: PropTypes.string.isRequired,
    type: PropTypes.string,
    filename: PropTypes.string,
    size: PropTypes.number,
  }).isRequired,
  isOwn: PropTypes.bool,
  progress: PropTypes.number,
};

export default AttachmentPreview;
