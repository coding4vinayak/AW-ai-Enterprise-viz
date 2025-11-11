import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { storage } from './storage';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { uploadMemory } from './middleware/file-upload'; // Import our secure upload middleware

const router = Router();

// Secure file upload endpoint
router.post('/upload', authenticateUser, uploadMemory.single('file'), async (req, res) => {
  try {
    const customerId = req.user!.customerId;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type and content
    const { originalname, buffer, mimetype } = req.file;
    
    // Check file extension
    const fileExt = originalname.split('.').pop()?.toLowerCase();
    if (!fileExt || !['csv', 'xlsx', 'xls'].includes(fileExt)) {
      return res.status(400).json({ error: 'Invalid file type. Only CSV, XLSX, and XLS files are allowed.' });
    }

    let parsedData: any[] = [];
    let columns: any[] = [];

    // Parse based on file type
    if (fileExt === 'csv') {
      const csvString = buffer.toString('utf-8');
      const result = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      if (result.errors.length > 0) {
        console.error('CSV parsing errors:', result.errors);
        return res.status(400).json({ error: 'Error parsing CSV file', details: result.errors });
      }
      
      parsedData = result.data as any[];
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.getWorksheet(1); // Use first worksheet
      if (!worksheet) {
        return res.status(400).json({ error: 'No worksheet found in Excel file' });
      }

      // Get the headers from the first row
      const headers: string[] = [];
      const firstRow = worksheet.getRow(1);
      firstRow.eachCell((cell, colNumber) => {
        headers.push(cell.text || `Column${colNumber}`);
      });

      // Process data rows
      parsedData = [];
      worksheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return; // Skip header row
        
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          // Convert Excel cell types to JavaScript types
          let cellValue = cell.value;
          if (cellValue instanceof Date) {
            cellValue = cellValue.toISOString();
          } else if (typeof cellValue === 'object' && cellValue !== null) {
            cellValue = JSON.stringify(cellValue);
          }
          rowData[headers[colNumber - 1]] = cellValue;
        });
        
        parsedData.push(rowData);
      });
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Validate parsed data
    if (parsedData.length === 0) {
      return res.status(400).json({ error: 'No data found in file' });
    }

    if (parsedData.length > 100000) { // Limit to 100k rows
      return res.status(400).json({ error: 'File too large: maximum 100,000 rows allowed' });
    }

    // Detect schema from first few rows
    const firstRow = parsedData[0];
    columns = Object.keys(firstRow).map((key) => {
      const sample = firstRow[key];
      let colType: "string" | "number" | "date" | "boolean" = "string";

      if (typeof sample === "number" && !isNaN(sample)) {
        colType = "number";
      } else if (typeof sample === "boolean") {
        colType = "boolean";
      } else if (sample && !isNaN(Date.parse(String(sample)))) {
        // Additional date format checks
        const dateStr = String(sample);
        if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/) || 
            dateStr.match(/^\d{4}-\d{2}-\d{2}$/) ||
            dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          colType = "date";
        }
      }

      return {
        name: key,
        type: colType,
        sample: sample,
      };
    });

    // Create the dataset with tenant isolation
    const dataset = await storage.createDataset({
      name: originalname.replace(/\.[^/.]+$/, ""), // Remove extension from name
      type: fileExt,
      uploadedData: parsedData,
      schemaInfo: { columns },
      rowCount: parsedData.length,
    }, customerId);

    res.json({
      id: dataset.id,
      name: dataset.name,
      type: dataset.type,
      rowCount: dataset.rowCount,
      columns: columns,
      message: 'File uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Secure file upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload and process file',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;