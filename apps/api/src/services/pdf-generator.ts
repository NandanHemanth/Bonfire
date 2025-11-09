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

export async function generateAnalysisPDF(analysisResult: any): Promise<Buffer> {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Data Analysis Report', 14, yPos);
  yPos += 15;

  // Generated date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
  yPos += 15;

  // Summary Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(analysisResult.summary, 180);
  summaryLines.forEach((line: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 14, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Key Insights Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Insights', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  analysisResult.insights.forEach((insight: string, idx: number) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const insightLines = doc.splitTextToSize(`${idx + 1}. ${insight}`, 175);
    insightLines.forEach((line: string) => {
      doc.text(line, 14, yPos);
      yPos += 6;
    });
    yPos += 3;
  });

  // Charts Section
  doc.addPage();
  yPos = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Visualizations Generated', 14, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  analysisResult.charts.forEach((chart: any, idx: number) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${idx + 1}. ${chart.title}`, 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'italic');
    doc.text(`   Type: ${chart.type.toUpperCase()}`, 20, yPos);
    yPos += 6;
    if (chart.xKey) {
      doc.text(`   X-Axis: ${chart.xKey}`, 20, yPos);
      yPos += 6;
    }
    if (chart.yKey) {
      doc.text(`   Y-Axis: ${chart.yKey}`, 20, yPos);
      yPos += 6;
    }
    doc.setFont('helvetica', 'normal');
    yPos += 4;
  });

  // Statistics Section
  doc.addPage();
  yPos = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistical Summary', 14, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  Object.entries(analysisResult.statistics).forEach(([column, stats]: [string, any]) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(column, 14, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    if (stats.type === 'numeric') {
      doc.text(`  Type: Numeric`, 20, yPos);
      yPos += 5;
      doc.text(`  Count: ${stats.count}`, 20, yPos);
      yPos += 5;
      doc.text(`  Mean: ${stats.mean.toFixed(2)}`, 20, yPos);
      yPos += 5;
      doc.text(`  Median: ${stats.median.toFixed(2)}`, 20, yPos);
      yPos += 5;
      doc.text(`  Min: ${stats.min.toFixed(2)}`, 20, yPos);
      yPos += 5;
      doc.text(`  Max: ${stats.max.toFixed(2)}`, 20, yPos);
      yPos += 8;
    } else {
      doc.text(`  Type: Categorical`, 20, yPos);
      yPos += 5;
      doc.text(`  Count: ${stats.count}`, 20, yPos);
      yPos += 5;
      doc.text(`  Unique Values: ${stats.unique}`, 20, yPos);
      yPos += 5;
      doc.text(`  Top Values:`, 20, yPos);
      yPos += 5;
      stats.topValues.forEach((tv: any) => {
        doc.text(`    ${tv.value}: ${tv.count}`, 25, yPos);
        yPos += 5;
      });
      yPos += 3;
    }
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Page ${i} of ${pageCount} | Generated by BonFire AI`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}
