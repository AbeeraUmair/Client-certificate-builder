"use server"

import type { Certificate } from "./types"
import * as XLSX from "xlsx"
import { google as googleapis } from "googleapis"
import { readFileSync } from "fs"
import path from "path"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

// ✅ Initialize Gemini AI
const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
})

export async function extractDataWithAI(inputTable: string): Promise<Certificate[]> {
  try {
    const result = await generateText({
      model: googleAI("models/gemini-1.5-flash"),
      prompt: `You will be given a spreadsheet-like table in JSON array format.
Convert it into a JSON array of certificates like this:

[
  {
    "id": "TF2001",
    "name": "Ali Khan",
    "date": "01-05-2025",
    "course": "Entrepreneur Program",
    "grade": "A"
  }
]

The date should be in the format "MM-DD-YYYY" and must be extracted from the provided data.
If no date is available, use today's date in MM-DD-YYYY format.
Only return pure JSON. Do NOT include \`\`\`json or Markdown formatting.

Here is the table data:\n\n${inputTable}`,
    })

    let text = result.text.trim()

    // 🧼 Strip markdown code block if it exists
    if (text.startsWith("```")) {
      text = text.replace(/```json|```/g, "").trim()
    }

    const parsed = JSON.parse(text)
    // console.log(parsed)
    return parsed.map((item: any) => ({
      ...item,
      downloadStatus: "ready",
    }))
  } catch (error) {
    console.error("Error extracting data with AI:", error)
    throw new Error("Failed to process data with AI")
  }
}


/**
 * Process Excel File
 */
export async function processExcelFile(file: File): Promise<Certificate[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    const textData = JSON.stringify(data)
    return await extractDataWithAI(textData)
  } catch (error) {
    console.error("Error processing Excel file:", error)
    throw new Error("Failed to process Excel file")
  }
}

/**
 * Process Google Sheet
 */
export async function processGoogleSheet(url: string): Promise<Certificate[]> {
  try {
    const spreadsheetId = url.match(/[-\w]{25,}/)?.[0]
    if (!spreadsheetId) throw new Error("Invalid Google Sheets URL")

    const keyFilePath = path.resolve(process.cwd(), "credentials/certificate-builder-459909-22e37da1d302.json")
    const credentials = JSON.parse(readFileSync(keyFilePath, "utf8"))

    const auth = new googleapis.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = googleapis.sheets({ version: "v4", auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A1:Z1000",
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) throw new Error("No data found in spreadsheet")

    const textData = JSON.stringify(rows)
    return await extractDataWithAI(textData)
  } catch (error) {
    console.error("Error processing Google Sheet:", error)
    throw new Error("Failed to process Google Sheet")
  }
}

