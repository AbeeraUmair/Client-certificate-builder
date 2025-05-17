"use client"

import { useRef, useEffect } from "react"
import type { Certificate, CertificateTemplate } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { renderCertificateToCanvas } from "@/lib/certificate-renderer"
import { markCertificateAsDownloaded } from "@/lib/download-tracker"

interface CertificatePreviewProps {
  certificate: Certificate | null
  template: CertificateTemplate
  onDownload?: (certificate: Certificate) => Promise<void>
}

export function CertificatePreview({ certificate, template, onDownload }: CertificatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (canvasRef.current && certificate) {
      renderCertificateToCanvas(canvasRef.current, certificate, template)
    }
  }, [certificate, template])

  const handleDownload = async () => {
    if (!canvasRef.current || !certificate) return

    const link = document.createElement("a")
    link.download = `${certificate.name.replace(/\s+/g, "-")}-certificate.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()

    // Mark as downloaded
    markCertificateAsDownloaded(certificate.id)

    // Call the onDownload callback if provided
    if (onDownload) {
      await onDownload(certificate)
    }
  }

  return (
    <div className="space-y-4">
      {certificate ? (
        <>
          <div
            ref={containerRef}
            className="relative bg-white border rounded-lg overflow-hidden shadow-md"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] bg-slate-100 rounded-lg border border-dashed border-slate-300">
          <img src="/images/techforce-logo.png" alt="Techforce Pakistan Logo" className="h-24 mb-4 opacity-30" />
          <p className="text-slate-500 text-center">Import data to preview certificates</p>
        </div>
      )}
    </div>
  )
}
