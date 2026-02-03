import React from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
  isComplete: boolean;
  hasError: boolean;
  fileName?: string;
  className?: string;
}

// Upload progress indicator component
const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  isUploading,
  isComplete,
  hasError,
  fileName,
  className = "",
}) => {
  if (!isUploading && !isComplete && !hasError) {
    return null;
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {hasError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : isComplete ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Upload className="w-5 h-5 text-blue-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {fileName && (
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {fileName}
            </p>
          )}

          {/* Status text */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {hasError
              ? "Upload failed"
              : isComplete
                ? "Upload complete"
                : `Uploading... ${progress}%`}
          </p>
        </div>

        {/* Progress percentage */}
        {isUploading && (
          <div className="flex-shrink-0">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {(isUploading || isComplete) && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                hasError
                  ? "bg-red-500"
                  : isComplete
                    ? "bg-green-500"
                    : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;
