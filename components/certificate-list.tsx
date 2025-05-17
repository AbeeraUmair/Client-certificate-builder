"use client"

import type { Certificate } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, Eye, CheckCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { markCertificateAsDownloaded } from "@/lib/download-tracker"

interface CertificateListProps {
  certificates: Certificate[]
  selectedCertificate: Certificate | null
  onSelectCertificate: (certificate: Certificate) => void
  onDownloadCertificate: (certificate: Certificate) => Promise<void>
}

export function CertificateList({
  certificates,
  selectedCertificate,
  onSelectCertificate,
  onDownloadCertificate,
}: CertificateListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDownload = async (certificate: Certificate) => {
    try {
      setDownloadingId(certificate.id)
      await onDownloadCertificate(certificate)
      markCertificateAsDownloaded(certificate.id)
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setDownloadingId(null)
    }
  }

  const getStatusBadge = (status: "pending" | "downloaded" | "ready") => {
    switch (status) {
      case "downloaded":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Downloaded
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Ready
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map((certificate) => (
                <TableRow
                  key={certificate.id}
                  className={selectedCertificate?.id === certificate.id ? "bg-slate-100" : ""}
                >
                  <TableCell className="font-medium">{certificate.name}</TableCell>
                  <TableCell>{certificate.id}</TableCell>
                  <TableCell>{getStatusBadge(certificate.downloadStatus)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectCertificate(certificate)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Download"
                        disabled={downloadingId === certificate.id}
                        onClick={() => handleDownload(certificate)}
                      >
                        {downloadingId === certificate.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                  No certificates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
