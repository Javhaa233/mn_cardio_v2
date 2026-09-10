import { useState, useRef } from "react";
import Helper from "helper";
import Server from "config/Server";

/**
 * Custom hook for managing file uploads with progress tracking and cancellation
 *
 * @returns {Object} Upload state and functions
 * @returns {number} uploadProgress - Upload progress percentage (0-100)
 * @returns {boolean} isUploading - Whether an upload is in progress
 * @returns {function} uploadFiles - Function to upload files with progress tracking
 * @returns {function} cancelUpload - Function to cancel ongoing upload
 */
export default function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const cancelTokenSource = useRef(null);

  /**
   * Upload files with progress tracking
   *
   * @param {Object} params
   * @param {Array} params.Value - Array of file objects
   * @param {Object} params.LinkedObjectInfo - Object linking information
   * @param {function} params.onSuccess - Success callback
   * @param {function} params.onError - Error callback
   */
  const uploadFiles = async ({
    Value,
    LinkedObjectInfo,
    onSuccess,
    onError,
  }) => {
    // Create cancel token source
    if (Server && Server.CancelToken) {
      cancelTokenSource.current = Server.CancelToken.source();
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await Helper.BaseCrudHelper.BaseUploadFile(
        { Value, LinkedObjectInfo },
        (resData) => {
          setIsUploading(false);
          setUploadProgress(0);
          cancelTokenSource.current = null;

          if (resData && resData.Success) {
            onSuccess && onSuccess(resData);
          } else if (resData && resData.Cancelled) {
            // Upload was cancelled
            console.log("Upload cancelled by user");
          } else {
            const errorMessage = resData?.Message || "Upload failed";
            onError && onError(errorMessage);
          }
        },
        (percent) => {
          setUploadProgress(percent);
        },
        cancelTokenSource.current ? cancelTokenSource.current.token : undefined,
      );
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      cancelTokenSource.current = null;
      const errorMessage = err.message || "Upload failed";
      onError && onError(errorMessage);
    }
  };

  /**
   * Cancel ongoing upload
   */
  const cancelUpload = () => {
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel("Upload cancelled by user");
      setIsUploading(false);
      setUploadProgress(0);
      cancelTokenSource.current = null;
    }
  };

  return {
    uploadProgress,
    isUploading,
    uploadFiles,
    cancelUpload,
  };
}
