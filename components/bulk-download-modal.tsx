"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Download, FileDown, FileIcon as FilePdf } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import type { Certificate } from "@/lib/types"

interface BulkDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  certificates: Certificate[]
  onDownload: (format: "pdf" | "png" | "zip", onProgress?: (progress: number) => void) => Promise<void>
  maxDownloadLimit?: number
}

export function BulkDownloadModal({
  isOpen,
  onClose,
  certificates,
  onDownload,
  maxDownloadLimit = 100,
}: BulkDownloadModalProps) {
  const [format, setFormat] = useState<"pdf" | "png" | "zip">("pdf")
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const certificateCount = certificates.length

  const exceedsLimit = certificateCount > maxDownloadLimit

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      setProgress(0)

      await onDownload(format, (progressValue) => {
        setProgress(progressValue)
      })

      // Show 100% completion
      setProgress(100)

      // Close after a short delay to show 100% completion
      setTimeout(() => {
        setIsDownloading(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Download error:", error)
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Certificates</DialogTitle>
          <DialogDescription>
            You are about to download {certificateCount} certificate{certificateCount !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        {exceedsLimit ? (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
            <p className="text-amber-800 text-sm">
              Warning: You are attempting to download {certificateCount} certificates, which exceeds the recommended
              limit of {maxDownloadLimit}. This may take a long time and use significant resources.
            </p>
          </div>
        ) : null}

        <div className="space-y-4 py-2">
          <RadioGroup value={format} onValueChange={(value) => setFormat(value as "pdf" | "png" | "zip")}>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <div className="grid gap-1.5 leading-none">
                <Label className="flex items-center gap-1.5" htmlFor="pdf">
                  <FilePdf className="h-4 w-4" />
                  PDF Format
                </Label>
                <p className="text-sm text-muted-foreground">Download all certificates as a single PDF document.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="png" id="png" />
              <div className="grid gap-1.5 leading-none">
                <Label className="flex items-center gap-1.5" htmlFor="png">
                  <FileDown className="h-4 w-4" />
                  PNG Format
                </Label>
                <p className="text-sm text-muted-foreground">Download all certificates as individual PNG images.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="zip" id="zip" />
              <div className="grid gap-1.5 leading-none">
                <Label className="flex items-center gap-1.5" htmlFor="zip">
                  <Download className="h-4 w-4" />
                  ZIP Archive
                </Label>
                <p className="text-sm text-muted-foreground">
                  Download all certificates as PNG images in a ZIP archive.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {isDownloading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Preparing {certificateCount} certificate{certificateCount !== 1 ? "s" : ""}...
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading || (exceedsLimit && format !== "zip")}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download {certificateCount} Certificate{certificateCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
