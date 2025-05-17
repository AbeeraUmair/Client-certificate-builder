export interface Certificate {
  id: string
  name: string
  date?: string
  course: string
  grade: string
  downloadStatus: "pending" | "downloaded" | "ready"
  downloadDate?: string
  additionalFields?: Record<string, string>
}

export interface CertificateTemplate {
  title: string
  subtitle: string
  message: string
  signatory: string
  signatoryTitle: string
  dateFormat: string
  primaryColor: string
  secondaryColor: string
  showLogo: boolean
  font?: string
  backgroundImage?: string
}

export interface DownloadHistory {
  certificateId: string
  downloadDate: string
  format: "pdf" | "png" | "zip"
}
