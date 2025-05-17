"use client"

import type { Certificate, CertificateTemplate } from "./types"
import { jsPDF } from "jspdf"
import { renderCertificateToCanvas } from "./certificate-renderer"

export async function generatePDF(certificates: Certificate[], template: CertificateTemplate): Promise<Blob> {
  // Create a PDF document
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  // Create a temporary canvas for rendering certificates
  const canvas = document.createElement("canvas")
  canvas.width = 1056
  canvas.height = 816
  document.body.appendChild(canvas)

  try {
    // Add each certificate to the PDF
    for (let i = 0; i < certificates.length; i++) {
      const certificate = certificates[i]

      // Render certificate to canvas
      await renderCertificateToCanvas(canvas, certificate, template)

      // Add canvas content to PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.95)

      // Add a new page for each certificate (except the first one)
      if (i > 0) {
        pdf.addPage()
      }

      // Add the certificate image to the PDF
      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210) // A4 landscape dimensions in mm
    }

    // Generate PDF blob
    const pdfBlob = pdf.output("blob")
    return pdfBlob
  } finally {
    // Clean up the temporary canvas
    document.body.removeChild(canvas)
  }
}
