import React from 'react';
import PropTypes from 'prop-types';

/**
 * FilePreview — shows image preview or generic file icon, supports remove.
 * Props:
 *  - file: File | { url, filename, type }
 *  - small: boolean for thumbnail size
 *  - onRemove: callback
 */

const FilePreview = ({ file, small, onRemove }) => {
  const isFileObject = typeof file === 'object' && file instanceof File;
  const url = isFileObject ? URL.createObjectURL(file) : file.url || file.preview || null;
  const filename = isFileObject ? file.name : file.filename || 'attachment';

  const thumbClass = small ? 'w-24 h-24' : 'w-40 h-40';

  return (
    <div className={`relative rounded overflow-hidden border ${small ? 'p-1' : 'p-2'}`}>
      {url ? (
        <img src={url} alt={filename} className={`object-cover ${thumbClass}`} />
      ) : (
        <div className={`flex items-center justify-center ${thumbClass} bg-gray-100 text-gray-500`}>
          <span className="text-xs">{filename}</span>
        </div>
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs focus:outline-none"
          aria-label={`Remove ${filename}`}
        >
          ✕
        </button>
      )}
    </div>
  );
};

FilePreview.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.object]).isRequired,
  small: PropTypes.bool,
  onRemove: PropTypes.func,
};

export default FilePreview;
