/**
 * FileUpload Components Usage Example
 *
 * This file demonstrates how to use the enhanced file upload system with:
 * - File validation (size, type)
 * - Upload progress tracking
 * - Upload cancellation
 * - Improved error messaging
 */

import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import BaseFileUpload from "./BaseFileUpload";
import FileUploadProgress from "./FileUploadProgress";
import useFileUpload from "./useFileUpload";
import Button from "components/CustomButtons/Button";

export default function FileUploadExample() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const { uploadProgress, isUploading, uploadFiles, cancelUpload } =
    useFileUpload();

  // Handle file upload
  const handleUpload = async (recordId) => {
    if (!files || files.length === 0) {
      alert("Please select files to upload");
      return;
    }

    await uploadFiles({
      Value: files,
      LinkedObjectInfo: {
        LinkedObjectName: "Visit", // Replace with your object name
        LinkedObjectId: recordId, // Replace with actual record ID
        FieldName: "Files",
      },
      onSuccess: (resData) => {
        console.log("Upload successful:", resData);
        alert("Files uploaded successfully!");
        setFiles([]); // Clear files after successful upload
      },
      onError: (errorMessage) => {
        console.error("Upload error:", errorMessage);
        alert(`Upload failed: ${errorMessage}`);
      },
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>File Upload Example</h2>

      {/* File Upload Component with Validation */}
      <BaseFileUpload
        Config={{
          Label: t("Attach Files"),
          Required: false,
        }}
        Value={files}
        ChangeValue={setFiles}
        WithLabel={true}
        maxFileSize={50} // Maximum 50MB per file
        allowedFileTypes={[
          "jpg",
          "jpeg",
          "png",
          "gif",
          "bmp",
          "tiff",
          "webp",
          "doc",
          "docx",
          "pdf",
          "mp4",
          "avi",
          "mov",
          "wmv",
          "flv",
          "webm",
          "mkv",
          "m4v",
        ]} // Restrict file types (defaults to common image, document, and video formats)
      />

      {/* Upload Progress Display */}
      <FileUploadProgress
        progress={uploadProgress}
        isUploading={isUploading}
        onCancel={cancelUpload}
        fileName={files.length > 0 ? `${files.length} file(s)` : null}
      />

      {/* Upload Button */}
      <div style={{ marginTop: "16px" }}>
        <Button
          color="primary"
          onClick={() => handleUpload(123)} // Replace 123 with actual record ID
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? "Uploading..." : "Upload Files"}
        </Button>
      </div>

      {/* Selected Files Info */}
      {files.length > 0 && !isUploading && (
        <div style={{ marginTop: "16px" }}>
          <p>
            <strong>Selected Files:</strong> {files.length}
          </p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.FileInfo.Name} (
                {file.File
                  ? (file.File.size / 1024 / 1024).toFixed(2) + " MB"
                  : "N/A"}
                )
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * INTEGRATION GUIDE:
 *
 * 1. Import the necessary components and hooks:
 *    import BaseFileUpload from "baseComponents/Controls/BaseFileUpload";
 *    import FileUploadProgress from "baseComponents/Controls/FileUploadProgress";
 *    import useFileUpload from "baseComponents/Controls/useFileUpload";
 *
 * 2. In your form component, use the useFileUpload hook:
 *    const { uploadProgress, isUploading, uploadFiles, cancelUpload } = useFileUpload();
 *
 * 3. Add state for managing files:
 *    const [files, setFiles] = useState([]);
 *
 * 4. Add BaseFileUpload component to your form:
 *    <BaseFileUpload
 *      Config={{ Label: t("Files") }}
 *      Value={files}
 *      ChangeValue={setFiles}
 *      maxFileSize={100}  // Optional: max size in MB
 *      allowedFileTypes={['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'doc', 'docx', 'pdf', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v']}  // Optional: allowed extensions (defaults to common image, document, and video formats)
 *    />
 *
 * 5. Add FileUploadProgress to show upload status:
 *    <FileUploadProgress
 *      progress={uploadProgress}
 *      isUploading={isUploading}
 *      onCancel={cancelUpload}
 *    />
 *
 * 6. Call uploadFiles when saving:
 *    uploadFiles({
 *      Value: files,
 *      LinkedObjectInfo: {
 *        LinkedObjectName: "YourObjectName",
 *        LinkedObjectId: savedRecordId,
 *        FieldName: "Files",
 *      },
 *      onSuccess: (resData) => { ... },
 *      onError: (error) => { ... },
 *    });
 *
 * FEATURES:
 * - File size validation (prevents upload of oversized files)
 * - File type validation (restricts allowed file extensions)
 * - Upload progress tracking (shows percentage completed)
 * - Upload cancellation (allows users to cancel mid-upload)
 * - Better error messages (shows specific error details)
 * - Memory cleanup (revokes object URLs after download)
 */
