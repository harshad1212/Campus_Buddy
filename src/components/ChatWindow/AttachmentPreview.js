import React, { useState } from "react";
import PropTypes from "prop-types";
import { FiDownload } from "react-icons/fi";
import {
  FileText,
  Image,
  Video,
  FileSpreadsheet,
  File
} from "lucide-react";

const AttachmentPreview = ({ file, isOwn, progress = 0 }) => {
  const [downloaded, setDownloaded] = useState(false);
  if (!file) return null;

  /* ---------------- DOWNLOAD ---------------- */
  const handleDownload = async () => {
    try {
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
          break;
      }

      const baseName = decodeURIComponent(
        file.url.split("/").pop().replace(/^\d+_/, "")
      );

      const res = await fetch(file.url);
      if (!res.ok) throw new Error("Download failed");

      const blob = new Blob([await res.arrayBuffer()], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = baseName.endsWith(extension)
        ? baseName
        : `${baseName}${extension}`;
      a.click();
      window.URL.revokeObjectURL(url);

      setDownloaded(true);
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    }
  };

  /* ---------------- FILE TYPE ---------------- */
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

  /* ---------------- UPLOAD PROGRESS ---------------- */
  const renderProgressOverlay = () => {
    if (!isOwn || progress <= 0 || progress >= 100) return null;

    const r = 18;
    const c = 2 * Math.PI * r;
    const offset = c - (c * progress) / 100;

    return (
      <div className="absolute inset-0 flex items-center justify-center
        bg-black/60 backdrop-blur-md rounded-xl z-20">
        <svg className="w-12 h-12 rotate-[-90deg]">
          <circle
            r={r}
            cx="24"
            cy="24"
            strokeWidth="4"
            stroke="rgba(255,255,255,0.2)"
            fill="none"
          />
          <circle
            r={r}
            cx="24"
            cy="24"
            strokeWidth="4"
            stroke="#6366f1"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute text-white text-sm font-medium">
          {progress}%
        </span>
      </div>
    );
  };

  /* ---------------- ICON ---------------- */
  const renderFileIcon = () => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-6 h-6 text-red-400" />;
      case "word":
        return <FileText className="w-6 h-6 text-blue-400" />;
      case "excel":
        return <FileSpreadsheet className="w-6 h-6 text-green-400" />;
      case "image":
        return <Image className="w-6 h-6 text-purple-400" />;
      case "video":
        return <Video className="w-6 h-6 text-pink-400" />;
      default:
        return <File className="w-6 h-6 text-slate-400" />;
    }
  };

  /* ---------------- IMAGE ---------------- */
  if (fileType === "image") {
    return (
      <div className="relative max-w-xs rounded-xl overflow-hidden
        bg-slate-900 border border-white/10 shadow-lg group">
        <img
          src={file.url}
          alt={file.filename || "image"}
          className="w-full h-48 object-cover"
        />

        {renderProgressOverlay()}

        {!isOwn && !downloaded && (
          <button
            onClick={handleDownload}
            className="absolute inset-0 flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition
              bg-black/60 backdrop-blur-md z-30"
          >
            <FiDownload className="text-white w-7 h-7" />
          </button>
        )}
      </div>
    );
  }

  /* ---------------- VIDEO ---------------- */
  if (fileType === "video") {
    return (
      <div className="relative max-w-xs rounded-xl overflow-hidden
        bg-slate-900 border border-white/10 shadow-lg group">
        <video src={file.url} controls className="w-full h-48 object-cover" />

        {renderProgressOverlay()}

        {!isOwn && !downloaded && (
          <button
            onClick={handleDownload}
            className="absolute inset-0 flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition
              bg-black/60 backdrop-blur-md z-30"
          >
            <FiDownload className="text-white w-7 h-7" />
          </button>
        )}
      </div>
    );
  }

  /* ---------------- DOCUMENT ---------------- */
  return (
    <div className="relative flex items-center gap-4 p-3
      bg-slate-900 border border-white/10 rounded-xl
      shadow-md hover:shadow-lg transition max-w-xs group">

      <div className="w-12 h-12 rounded-lg bg-slate-800
        flex items-center justify-center">
        {renderFileIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-slate-200 truncate">
          {file.filename || "file"}
        </span>
        {file.size && (
          <span className="text-xs text-slate-400">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>

      {renderProgressOverlay()}

      {!isOwn && !downloaded && (
        <button
          onClick={handleDownload}
          className="w-8 h-8 rounded-full flex items-center justify-center
            text-slate-400 hover:text-indigo-400 transition"
        >
          <FiDownload className="w-5 h-5" />
        </button>
      )}

      {downloaded && (
        <span className="absolute top-1 right-2 text-xs text-green-400">
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
