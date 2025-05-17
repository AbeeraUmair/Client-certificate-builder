"use client"

import { useState, useEffect, useRef } from "react"
import { FileUploader } from "./file-uploader"
import { CertificatePreview } from "./certificate-preview"
import { CertificateList } from "./certificate-list"
import { BulkDownloadModal } from "./bulk-download-modal"
import { DownloadHistoryComponent } from "./download-history"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processExcelFile, processGoogleSheet } from "@/lib/data-processor"
import type { Certificate, CertificateTemplate } from "@/lib/types"
import { defaultTemplate } from "@/lib/default-template"
import { Download, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateCertificatesPDF, generateCertificatesZIP, renderCertificateToCanvas } from "@/lib/certificate-renderer"
import {
  updateCertificateStatus,
  markCertificateAsDownloaded,
  getReadyCertificates,
  getDownloadedCertificates,
} from "@/lib/download-tracker"

export function CertificateBuilder() {
  const [isLoading, setIsLoading] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [template, setTemplate] = useState<CertificateTemplate>(defaultTemplate)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isBulkDownloadModalOpen, setIsBulkDownloadModalOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "ready" | "downloaded">("all")
  const { toast } = useToast()

  // Use a ref to track if we've already updated the certificates
  const hasUpdatedStatus = useRef(false)

  // Update certificate status from local storage only once when certificates are loaded
  useEffect(() => {
    if (certificates.length > 0 && !hasUpdatedStatus.current) {
      const updatedCertificates = updateCertificateStatus(certificates)
      hasUpdatedStatus.current = true
      setCertificates(updatedCertificates)
    }
  }, [certificates])

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true)
      const data = await processExcelFile(file)
    
      // Add download status to each certificate
      const dataWithStatus = data.map((cert) => ({
        ...cert,
        downloadStatus: "ready" as const,
      }))

      // Reset the status update flag when loading new data
      hasUpdatedStatus.current = false
      setCertificates(dataWithStatus)

      if (dataWithStatus.length > 0) {
        setSelectedCertificate(dataWithStatus[0])
        toast({
          title: "File processed successfully",
          description: `${dataWithStatus.length} certificates ready to generate`,
        })
      }
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSheetImport = async (url: string) => {
    try {
      setIsLoading(true)
      const data = await processGoogleSheet(url)

      // Add download status to each certificate
      const dataWithStatus = data.map((cert) => ({
        ...cert,
        downloadStatus: "ready" as const,
      }))

      // Reset the status update flag when loading new data
      hasUpdatedStatus.current = false
      setCertificates(dataWithStatus)

      if (dataWithStatus.length > 0) {
        setSelectedCertificate(dataWithStatus[0])
        toast({
          title: "Google Sheet processed successfully",
          description: `${dataWithStatus.length} certificates ready to generate`,
        })
      }
    } catch (error) {
      toast({
        title: "Error processing Google Sheet",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  //its not using in code ,because we disabled custom borders
  // const handleTemplateChange = (newTemplate: Partial<CertificateTemplate>) => {
  //   setTemplate({
  //     ...template,
  //     ...newTemplate,
  //   })
  // }

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 1056
      canvas.height = 816
      document.body.appendChild(canvas)

      try {
        await renderCertificateToCanvas(canvas, certificate, template)
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png")
        })

        // Create a download link and trigger the download
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${certificate.name.replace(/\s+/g, "-")}-certificate.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        // Mark as downloaded and update the certificates list
        markCertificateAsDownloaded(certificate.id)

        // Update the certificates list with the new status
        setCertificates((prev) =>
          prev.map((cert) => (cert.id === certificate.id ? { ...cert, downloadStatus: "downloaded" as const } : cert)),
        )

        toast({
          title: "Download complete",
          description: `Certificate for ${certificate.name} has been downloaded`,
        })
      } finally {
        document.body.removeChild(canvas)
      }
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleBulkDownload = async (format: "pdf" | "png" | "zip", onProgress?: (progress: number) => void) => {
    try {
      if (certificates.length === 0) {
        throw new Error("No certificates to download")
      }

      let blob: Blob
      let filename: string

      switch (format) {
        case "pdf":
          // For PDF, we'll use a simple progress simulation
          if (onProgress) {
            // Simulate progress for PDF generation
            let progress = 0
            const interval = setInterval(() => {
              progress += 5
              if (progress > 90) {
                clearInterval(interval)
              }
              onProgress(progress)
            }, 100)
          }

          blob = await generateCertificatesPDF(certificates, template)
          filename = "techforce-certificates.pdf"
          break

        case "zip":
          // For ZIP, we'll generate a real ZIP file with progress updates
          blob = await generateCertificatesZIP(certificates, template)
          filename = "techforce-certificates.zip"
          break

        case "png":
          // For PNG, we'll just download the first certificate as an example
          if (!selectedCertificate) {
            throw new Error("No certificate selected")
          }

          if (onProgress) {
            onProgress(50) // Set initial progress
          }

          const canvas = document.createElement("canvas")
          canvas.width = 1056
          canvas.height = 816
          document.body.appendChild(canvas)

          try {
            await renderCertificateToCanvas(canvas, selectedCertificate, template)
            blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((b) => resolve(b!), "image/png")
            })
            filename = `${selectedCertificate.name.replace(/\s+/g, "-")}-certificate.png`

            if (onProgress) {
              onProgress(90) // Almost done
            }
          } finally {
            document.body.removeChild(canvas)
          }
          break

        default:
          throw new Error("Invalid format")
      }

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Mark all certificates as downloaded
      certificates.forEach((cert) => {
        markCertificateAsDownloaded(cert.id)
      })

      // Update the certificates list with the new status
      setCertificates((prev) => prev.map((cert) => ({ ...cert, downloadStatus: "downloaded" as const })))

      toast({
        title: "Download complete",
        description: `Your certificates have been downloaded as ${format.toUpperCase()}`,
      })

      // Final progress update
      if (onProgress) {
        onProgress(100)
      }
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      throw error // Re-throw to be caught by the modal
    }
  }

  // Filter certificates based on active tab
  const getFilteredCertificates = () => {
    switch (activeTab) {
      case "ready":
        return getReadyCertificates(certificates)
      case "downloaded":
        return getDownloadedCertificates(certificates)
      case "all":
      default:
        return certificates
    }
  }

  const filteredCertificates = getFilteredCertificates()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Import Data</h2>
          <Tabs defaultValue="excel">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="excel">Excel File</TabsTrigger>
              <TabsTrigger value="google">Google Sheet</TabsTrigger>
            </TabsList>
            <TabsContent value="excel">
              <FileUploader onFileUpload={handleFileUpload} />
            </TabsContent>
            <TabsContent value="google">
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Enter the URL of your Google Sheet. Make sure it&apos;s shared with view access.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.target as HTMLFormElement
                    const url = (form.elements.namedItem("sheetUrl") as HTMLInputElement).value
                    handleGoogleSheetImport(url)
                  }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    name="sheetUrl"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full p-2 border rounded"
                    required
                  />
                  <Button type="submit" className="w-full">
                    Import Sheet
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      
        {showHistory && <DownloadHistoryComponent />}
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Certificate Preview</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1"
              >
                <History className="h-4 w-4" />
                {showHistory ? "Hide History" : "Show History"}
              </Button>
              <Button
                onClick={() => setIsBulkDownloadModalOpen(true)}
                disabled={isLoading || certificates.length === 0}
                className="bg-slate-800 hover:bg-slate-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Bulk Download
              </Button>
            </div>
          </div>
          <CertificatePreview
            certificate={selectedCertificate}
            template={template}
            onDownload={handleDownloadCertificate}
          />
        </div>

        {certificates.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Recipients ({certificates.length})</h2>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "all" | "ready" | "downloaded")}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="ready">Ready</TabsTrigger>
                  <TabsTrigger value="downloaded">Downloaded</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CertificateList
              certificates={filteredCertificates}
              selectedCertificate={selectedCertificate}
              onSelectCertificate={setSelectedCertificate}
              onDownloadCertificate={handleDownloadCertificate}
            />
          </div>
        )}
      </div>

      <BulkDownloadModal
        isOpen={isBulkDownloadModalOpen}
        onClose={() => setIsBulkDownloadModalOpen(false)}
        certificates={certificates}
        onDownload={handleBulkDownload}
        maxDownloadLimit={50}
      />
    </div>
  )
}
