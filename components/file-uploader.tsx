"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    // Check if the file is an Excel file
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
      alert("Please upload an Excel file (.xlsx, .xls) or CSV file (.csv)")
      return
    }

    setFileName(file.name)
    onFileUpload(file)
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls,.csv" className="hidden" />
        <Upload className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-700">
          Drag and drop your Excel file here, or click to browse
        </p>
        <p className="mt-1 text-xs text-slate-500">Supports .xlsx, .xls, and .csv files</p>
      </div>

      {fileName && (
        <div className="flex items-center p-3 bg-slate-100 rounded-md">
          <File className="h-5 w-5 text-slate-500 mr-2" />
          <span className="text-sm font-medium text-slate-700 truncate flex-1">{fileName}</span>
        </div>
      )}
    </div>
  )
}
