import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

export function readExcelData(filePath: string, sheetName: string): ExcelRow[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in file "${filePath}".`);
    }
    const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
    return jsonData;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
} 