"use client"

import { useState, useEffect } from "react"
import { getDownloadHistory } from "@/lib/download-tracker"
import type { DownloadHistory } from "@/lib/types"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDown, FileIcon as FilePdf, Archive } from "lucide-react"

export function DownloadHistoryComponent() {
  const [history, setHistory] = useState<DownloadHistory[]>([])

  useEffect(() => {
    // Initial load
    setHistory(getDownloadHistory())

    // Set up an interval to refresh the history
    const interval = setInterval(() => {
      const newHistory = getDownloadHistory()
      // Only update if there's a change to avoid unnecessary re-renders
      if (JSON.stringify(newHistory) !== JSON.stringify(history)) {
        setHistory(newHistory)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, []) // Empty dependency array to run only on mount

  if (history.length === 0) {
    return null
  }

  const getFormatIcon = (format: "pdf" | "png" | "zip") => {
    switch (format) {
      case "pdf":
        return <FilePdf className="h-4 w-4 text-red-500" />
      case "zip":
        return <Archive className="h-4 w-4 text-yellow-500" />
      case "png":
      default:
        return <FileDown className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download History</CardTitle>
        <CardDescription>Your recent certificate downloads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                {getFormatIcon(item.format)}
                <span className="text-sm font-medium">Certificate {item.certificateId}</span>
              </div>
              <span className="text-xs text-slate-500">
                {format(new Date(item.downloadDate), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          ))}

          {history.length > 5 && (
            <p className="text-xs text-center text-slate-500">+ {history.length - 5} more downloads</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
