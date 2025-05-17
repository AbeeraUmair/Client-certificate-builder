"use client"

import type { Certificate, CertificateTemplate } from "./types"
import { format } from "date-fns"
import JSZip from "jszip"
import jsPDF from "jspdf"
// Constants for certificate layout
const CERTIFICATE_CONSTANTS = {
  WIDTH: 1056,
  HEIGHT: 816,
  MARGIN: 50,
  LOGO_WIDTH: 220,
  LOGO_TOP_MARGIN: 70,
  TITLE_Y: 290,
  SUBTITLE_Y: 340,
  NAME_Y: 390,
  MESSAGE_Y_START: 435,
  LINE_HEIGHT: 30,
  SIGNATURE_Y: 190,
  SIGNATURE_LINE_WIDTH: 120,
  SIGNATURE_NAME_Y: 140,
  SIGNATURE_TITLE_Y: 110,
  WATERMARK_OPACITY: 0.04,
}

// Font definitions for certificate
const CERTIFICATE_FONTS = {
  TITLE: "bold 52px 'Playfair Display', serif",
  SUBTITLE: "italic 26px 'Playfair Display', serif",
  NAME: "bold 40px 'Playfair Display', serif",
  MESSAGE: "20px 'Inter', sans-serif",
  DATE: "italic 18px 'Inter', sans-serif",
  SIGNATURE: "bold 24px 'Playfair Display', serif",
  SIGNATURE_TITLE: "16px 'Inter', sans-serif",
}

// New function to draw custom background image
async function drawCustomBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: CertificateTemplate
) {
  if (!template.backgroundImage) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = template.backgroundImage as string;

    img.onload = () => {
      // Draw the background image to fill the canvas
      ctx.drawImage(img, 0, 0, width, height);
      resolve();
    };

    img.onerror = () => {
      // If the background image fails to load, just continue
      console.error("Failed to load custom background image:", template.backgroundImage);
      resolve();
    };
  });
}

export async function renderCertificateToCanvas(
  canvas: HTMLCanvasElement,
  certificate: Certificate,
  template: CertificateTemplate,
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Set canvas dimensions
  canvas.width = CERTIFICATE_CONSTANTS.WIDTH
  canvas.height = CERTIFICATE_CONSTANTS.HEIGHT

  const width = canvas.width
  const height = canvas.height

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Set background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Always try to use the background image first if available
  if (template.backgroundImage) {
    await drawCustomBackground(ctx, width, height, template);
  } else {
    // Fall back to the default background texture and border if no image
    await drawBackgroundTexture(ctx, width, height, template);
    drawBorder(ctx, width, height, template);
  }

  // Draw watermark logo if enabled
  if (template.showLogo) {
    await drawWatermarkLogo(ctx, width, height, template)
  }

  // Draw logo if enabled
  if (template.showLogo) {
    await drawLogo(ctx, width, height, template)
  }

  // Draw certificate content
  drawContent(ctx, width, height, certificate, template)

  // document.body.removeChild(canvas);
}

async function drawBackgroundTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: CertificateTemplate,
) {
  // Create subtle gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, "#ffffff")
  gradient.addColorStop(0.5, "#fafbfc")
  gradient.addColorStop(1, "#ffffff")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Add subtle pattern
  ctx.save()
  ctx.globalAlpha = 0.03

  // Draw subtle grid pattern
  ctx.strokeStyle = template.primaryColor
  ctx.lineWidth = 0.5

  const gridSize = 40
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.restore()
}

function drawBorder(ctx: CanvasRenderingContext2D, width: number, height: number, template: CertificateTemplate) {
  const margin = CERTIFICATE_CONSTANTS.MARGIN

  ctx.strokeStyle = template.primaryColor

}

async function drawWatermarkLogo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: CertificateTemplate,
) {
  return new Promise<void>((resolve) => {
    const logo = new Image()
    logo.crossOrigin = "anonymous"
    logo.src = "/images/techforce-logo.png"

    logo.onload = () => {
      // Draw large watermark logo in the background
      ctx.save()
      ctx.globalAlpha = CERTIFICATE_CONSTANTS.WATERMARK_OPACITY

      const watermarkSize = Math.min(width, height) * 0.7
      const watermarkX = (width - watermarkSize) / 2
      const watermarkY = (height - watermarkSize) / 2

      ctx.drawImage(logo, watermarkX, watermarkY, watermarkSize, watermarkSize)
      ctx.restore()

      resolve()
    }

    logo.onerror = () => {
      // If logo fails to load, just continue
      resolve()
    }
  })
}

async function drawLogo(ctx: CanvasRenderingContext2D, width: number, height: number, template: CertificateTemplate) {
  return new Promise<void>((resolve) => {
    const logo = new Image()
    logo.crossOrigin = "anonymous"
    logo.src = "/images/techforce-logo.png"

    logo.onload = () => {
      const logoWidth = CERTIFICATE_CONSTANTS.LOGO_WIDTH
      const logoHeight = (logo.height / logo.width) * logoWidth
      const x = (width - logoWidth) / 2
      const y = CERTIFICATE_CONSTANTS.LOGO_TOP_MARGIN

      // Draw a subtle shadow for the logo
      ctx.save()
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.drawImage(logo, x, y, logoWidth, logoHeight)
      ctx.restore()

      resolve()
    }

    logo.onerror = () => {
      // If logo fails to load, just continue
      resolve()
    }
  })
}

function drawContent(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  certificate: Certificate,
  template: CertificateTemplate,
) {
  // Set text alignment to center
  ctx.textAlign = "center"

  // Add subtle shadow to text
  ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1

  // Draw title with gradient
  const titleGradient = ctx.createLinearGradient(
    width / 2 - 200,
    CERTIFICATE_CONSTANTS.TITLE_Y,
    width / 2 + 200,
    CERTIFICATE_CONSTANTS.TITLE_Y,
  )
  titleGradient.addColorStop(0, template.primaryColor)
  titleGradient.addColorStop(1, template.primaryColor)

  ctx.font = CERTIFICATE_FONTS.TITLE
  ctx.fillStyle = titleGradient
  ctx.fillText(template.title, width / 2, CERTIFICATE_CONSTANTS.TITLE_Y)

  // Draw subtitle
  ctx.font = CERTIFICATE_FONTS.SUBTITLE
  ctx.fillStyle = template.primaryColor
  ctx.fillText(template.subtitle, width / 2, CERTIFICATE_CONSTANTS.SUBTITLE_Y)

  // Draw name with secondary color
  ctx.font = CERTIFICATE_FONTS.NAME
  ctx.fillStyle = "#0b62aa"
  ctx.fillText(certificate.name.toUpperCase(), width / 2, CERTIFICATE_CONSTANTS.NAME_Y)

  // Reset shadow for regular text
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Draw message
  ctx.font = CERTIFICATE_FONTS.MESSAGE
  ctx.fillStyle = "#333333"

  // Format the date for replacement in message
  const formattedDate = certificate.date
    ? format(new Date(certificate.date), template.dateFormat)
    : format(new Date(), template.dateFormat)

  const message = template.message
    .replace("[name]", certificate.name.toUpperCase())
    .replace("[id]", certificate.id)
    .replace("[course]", certificate.course || "[course]")
    .replace("[grade]", certificate.grade || "[grade]")
    .replace("[date]", formattedDate)

  // Split message into multiple lines if needed
  const words = message.split(" ")
  let line = ""
  const lines = []
  const maxWidth = width - 200

  for (const word of words) {
    const testLine = line + word + " "
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && line !== "") {
      lines.push(line)
      line = word + " "
    } else {
      line = testLine
    }
  }

  if (line !== "") {
    lines.push(line)
  }

  // Draw each line
  let y = CERTIFICATE_CONSTANTS.MESSAGE_Y_START
  for (const line of lines) {
    ctx.fillText(line, width / 2, y)
    y += CERTIFICATE_CONSTANTS.LINE_HEIGHT
  }

  // Draw date with styled formatting
  let dateStr;
  try {
    // Try to parse the date - handle both MM-DD-YYYY format and ISO strings
    dateStr = certificate.date
      ? format(new Date(certificate.date), template.dateFormat)
      : format(new Date(), template.dateFormat);
  } catch (error) {
    // Fallback to current date if parsing fails
    console.error("Error parsing date:", error);
    dateStr = format(new Date(), template.dateFormat);
  }

  // Make date more prominent
  ctx.font = "bold italic 20px 'Inter', sans-serif"
  ctx.fillStyle = template.primaryColor
  ctx.fillText(`Issued on ${dateStr}`, width / 2, y + 30)

  // Draw signature with enhanced styling
  ctx.font = CERTIFICATE_FONTS.SIGNATURE
  ctx.fillStyle = template.primaryColor
  ctx.fillText(template.signatory, width / 2, height - CERTIFICATE_CONSTANTS.SIGNATURE_NAME_Y)

  ctx.beginPath()
  ctx.moveTo(width / 2 - CERTIFICATE_CONSTANTS.SIGNATURE_LINE_WIDTH, height - CERTIFICATE_CONSTANTS.SIGNATURE_Y)
  ctx.lineTo(width / 2 + CERTIFICATE_CONSTANTS.SIGNATURE_LINE_WIDTH, height - CERTIFICATE_CONSTANTS.SIGNATURE_Y)
  ctx.strokeStyle = "#0b62aa"
  ctx.lineWidth = 4
  ctx.stroke()

  // Draw signatory title
  ctx.font = CERTIFICATE_FONTS.SIGNATURE_TITLE
  ctx.fillStyle = "#333333"
  ctx.fillText(template.signatoryTitle, width / 2, height - CERTIFICATE_CONSTANTS.SIGNATURE_TITLE_Y)

}


// Function to generate a PDF from multiple certificates
export async function generateCertificatesPDF(
  certificates: Certificate[],
  template: CertificateTemplate,
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [1056, 816], // match your canvas size
  });

  // Create a temporary canvas for rendering certificates
  const canvas = document.createElement("canvas");
  canvas.width = 1056;
  canvas.height = 816;

  for (let i = 0; i < certificates.length; i++) {
    await renderCertificateToCanvas(canvas, certificates[i], template);
    const imgData = canvas.toDataURL("image/png");

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, 1056, 816);
  }

  // Clean up
  if (canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }

  return pdf.output("blob");
}

// Function to generate a ZIP file containing PNG images
export async function generateCertificatesZIP(
  certificates: Certificate[],
  template: CertificateTemplate,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  // Check if JSZip is available
  if (typeof JSZip === "undefined") {
    console.error("JSZip is not available. Make sure to include the JSZip library.")
    throw new Error("JSZip library not found")
  }

  // Create a new JSZip instance
  const zip = new JSZip()

  // Create a temporary canvas for rendering certificates
  const canvas = document.createElement("canvas")
  canvas.width = CERTIFICATE_CONSTANTS.WIDTH
  canvas.height = CERTIFICATE_CONSTANTS.HEIGHT
  document.body.appendChild(canvas)

  try {
    // Process each certificate
    for (let i = 0; i < certificates.length; i++) {
      const certificate = certificates[i]

      // Update progress
      if (onProgress) {
        const progress = Math.round((i / certificates.length) * 90) // Up to 90%
        onProgress(progress)
      }

      // Render certificate to canvas
      await renderCertificateToCanvas(canvas, certificate, template)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png")
      })

      // Add the blob to the zip file with a filename based on the certificate
      const fileName = `${certificate.name.replace(/\s+/g, "-")}-certificate.png`
      zip.file(fileName, blob)
    }

    // Update progress to indicate we're generating the zip
    if (onProgress) {
      onProgress(95)
    }

    // Generate the zip file
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    })

    // Final progress update
    if (onProgress) {
      onProgress(100)
    }

    return zipBlob
  } finally {
    // Clean up the temporary canvas
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }
}
