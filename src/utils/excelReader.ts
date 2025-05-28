import * as XLSX from 'xlsx';
import logger from './logger'; // Import the logger

interface ExcelRow {
  [key: string]: any;
}

export function readExcelData(filePath: string, sheetName: string): ExcelRow[] {
  try {
    const workbook = XLSX.readFile(filePath, { cellDates: true }); // cellDates for better date handling
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      logger.error(`Sheet "${sheetName}" not found in workbook "${filePath}".`);
      throw new Error(`Sheet "${sheetName}" not found in workbook "${filePath}".`);
    }
    const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
    logger.info(`Successfully read ${jsonData.length} rows from "${filePath}", sheet "${sheetName}".`);
    return jsonData;
  } catch (error) {
    logger.error(`Error reading Excel file "${filePath}", sheet "${sheetName}": ${(error as Error).message}`, { stack: (error as Error).stack });
    // Re-throw the error so that the calling code (e.g., the test) can handle it, fail the test, etc.
    throw error;
  }
} 