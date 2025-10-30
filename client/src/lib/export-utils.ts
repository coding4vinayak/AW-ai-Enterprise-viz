import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';

export interface ExportOptions {
  filename: string;
  format: 'pdf' | 'png' | 'excel';
  element?: HTMLElement;
  data?: any[];
  columns?: string[];
}

export async function exportToPNG(element: HTMLElement, filename: string): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw new Error('Failed to export to PNG');
  }
}

export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(
      imgData,
      'PNG',
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
}

export async function exportToExcel(
  data: any[],
  columns: string[],
  filename: string
): Promise<void> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    worksheet.columns = columns.map((col) => ({
      header: col,
      key: col,
      width: 15,
    }));

    worksheet.addRows(data);

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.download = `${filename}.xlsx`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
}

export async function exportDashboard(
  options: ExportOptions
): Promise<void> {
  const { filename, format, element, data, columns } = options;

  switch (format) {
    case 'png':
      if (!element) throw new Error('Element required for PNG export');
      await exportToPNG(element, filename);
      break;

    case 'pdf':
      if (!element) throw new Error('Element required for PDF export');
      await exportToPDF(element, filename);
      break;

    case 'excel':
      if (!data || !columns) throw new Error('Data and columns required for Excel export');
      await exportToExcel(data, columns, filename);
      break;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export async function exportChartData(chartData: any[], chartTitle: string): Promise<void> {
  if (!chartData || chartData.length === 0) {
    throw new Error('No data to export');
  }

  const columns = Object.keys(chartData[0]);
  await exportToExcel(chartData, columns, chartTitle);
}
