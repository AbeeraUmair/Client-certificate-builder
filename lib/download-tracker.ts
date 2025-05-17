"use client"

import type { Certificate, DownloadHistory } from "./types"

// Local storage keys
const DOWNLOAD_HISTORY_KEY = "certificate-download-history"
const CERTIFICATE_STATUS_KEY = "certificate-status"

// Function to get download history from local storage
export function getDownloadHistory(): DownloadHistory[] {
  if (typeof window === "undefined") return []

  const history = localStorage.getItem(DOWNLOAD_HISTORY_KEY)
  return history ? JSON.parse(history) : []
}

// Function to add a download to history
export function addDownloadToHistory(certificateId: string, format: "pdf" | "png" | "zip"): void {
  if (typeof window === "undefined") return

  const history = getDownloadHistory()
  const downloadDate = new Date().toISOString()

  history.push({
    certificateId,
    downloadDate,
    format,
  })

  localStorage.setItem(DOWNLOAD_HISTORY_KEY, JSON.stringify(history))
}

// Function to update certificate download status
export function updateCertificateStatus(certificates: Certificate[]): Certificate[] {
  if (typeof window === "undefined") return certificates

  // Get current status from local storage
  const statusJson = localStorage.getItem(CERTIFICATE_STATUS_KEY)
  const statusMap: Record<string, "pending" | "downloaded" | "ready"> = statusJson ? JSON.parse(statusJson) : {}

  // Check if any status needs updating
  let hasChanges = false

  // Update certificates with stored status
  const updatedCertificates = certificates.map((cert) => {
    if (statusMap[cert.id] && cert.downloadStatus !== statusMap[cert.id]) {
      hasChanges = true
      return { ...cert, downloadStatus: statusMap[cert.id] }
    }
    return cert
  })

  // Only return a new array if there were changes
  return hasChanges ? updatedCertificates : certificates
}

// Function to mark a certificate as downloaded
export function markCertificateAsDownloaded(certificateId: string): void {
  if (typeof window === "undefined") return

  // Get current status from local storage
  const statusJson = localStorage.getItem(CERTIFICATE_STATUS_KEY)
  const statusMap: Record<string, "pending" | "downloaded" | "ready"> = statusJson ? JSON.parse(statusJson) : {}

  // Update status
  statusMap[certificateId] = "downloaded"

  // Save back to local storage
  localStorage.setItem(CERTIFICATE_STATUS_KEY, JSON.stringify(statusMap))

  // Add to download history
  addDownloadToHistory(certificateId, "png")
}

// Function to get certificates that are ready for download
export function getReadyCertificates(certificates: Certificate[]): Certificate[] {
  return certificates.filter((cert) => cert.downloadStatus === "ready" || cert.downloadStatus === "pending")
}

// Function to get downloaded certificates
export function getDownloadedCertificates(certificates: Certificate[]): Certificate[] {
  return certificates.filter((cert) => cert.downloadStatus === "downloaded")
}
