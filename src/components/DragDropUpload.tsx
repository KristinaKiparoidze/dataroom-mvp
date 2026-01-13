import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadIcon } from "./Icons";
import { SUPPORTED_FILE_TYPE } from "../constants";

type DragDropUploadProps = {
  onUpload: (file: File) => void;
};

function DragDropUpload({ onUpload }: DragDropUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdfFiles = acceptedFiles.filter(
        (file) => file.type === SUPPORTED_FILE_TYPE
      );
      pdfFiles.forEach((file) => onUpload(file));
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [SUPPORTED_FILE_TYPE]: [".pdf"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
        isDragActive
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      }`}
      role="button"
      aria-label="Upload PDF files"
      tabIndex={0}
    >
      <input {...getInputProps()} aria-label="File upload input" />
      <UploadIcon className="w-14 h-14 mx-auto mb-3 text-gray-400" />
      <p className="text-gray-700 font-medium text-base">
        {isDragActive
          ? "Drop your PDF files here..."
          : "Drag PDF files here or click to browse"}
      </p>
    </div>
  );
}

export default DragDropUpload;
