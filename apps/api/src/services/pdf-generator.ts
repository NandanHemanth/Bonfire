
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePdf = (analysis: any, csvData: any[]): Buffer => {
  const doc = new jsPDF();

  doc.text('Data Analysis Report', 14, 16);

  doc.setFontSize(12);
  doc.text('Key Insights:', 14, 30);
  let y = 36;
  analysis.keyInsights.forEach((insight: string) => {
    const splitInsight = doc.splitTextToSize(insight, 180);
    doc.text(splitInsight, 14, y);
    y += (splitInsight.length * 5) + 5;
  });

  doc.addPage();
  doc.text('Column Analysis', 14, 16);
  const tableData = analysis.columnAnalysis.map((col: any) => [
    col.column,
    col.type,
    col.description,
    col.missingValues,
  ]);
  (doc as any).autoTable({
    head: [['Column', 'Type', 'Description', 'Missing Values']],
    body: tableData,
    startY: 20,
  });

  doc.addPage();
  doc.text('Raw Data', 14, 16);
  const csvTableData = csvData.map(row => Object.values(row));
  const csvHeaders = Object.keys(csvData[0]);
  (doc as any).autoTable({
    head: [csvHeaders],
    body: csvTableData,
    startY: 20,
  });


  return Buffer.from(doc.output('arraybuffer'));
};
