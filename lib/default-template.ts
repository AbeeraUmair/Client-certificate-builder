import type { CertificateTemplate } from "./types"

export const defaultTemplate: CertificateTemplate = {
  title: "Certificate of Achievement",
  subtitle: "This is to certify that",
  message: "has successfully completed the [course] with grade [grade] and ID [id]",
  signatory: "John Doe",
  signatoryTitle: "Program Director",
  dateFormat: "MMMM d, yyyy",
  primaryColor: "#0f2e4d", // Dark slate blue
  secondaryColor: "#0ea5e9", // Light blue
  showLogo: true,
  font: "Playfair Display", // More certificate-appropriate font
  backgroundImage: "/images/Blue_Certificate_Border_Transparent.png" // Using the blue certificate border image
}
