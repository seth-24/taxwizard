import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './tax-utils';

export function generateTaxReport(data: {
  income: number;
  federalTax: number;
  stateTax: number;
  effectiveRate: number;
  filingStatus: string;
  state: string;
  calculatedAt: string;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(20);
  doc.text('TaxPro Advisor - Tax Calculation Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

  // Summary Table
  autoTable(doc, {
    startY: 40,
    head: [['Item', 'Value']],
    body: [
      ['Income', formatCurrency(data.income)],
      ['Federal Tax', formatCurrency(data.federalTax)],
      ['State Tax', formatCurrency(data.stateTax)],
      ['Total Tax', formatCurrency(data.federalTax + data.stateTax)],
      ['Effective Tax Rate', `${data.effectiveRate.toFixed(1)}%`],
      ['Filing Status', data.filingStatus.replace(/([A-Z])/g, ' $1').trim()],
      ['State', data.state],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  // Disclaimer
  doc.setFontSize(8);
  const disclaimer = 'This report is for estimation purposes only. Please consult with a tax professional for official tax advice.';
  doc.text(disclaimer, pageWidth / 2, doc.lastAutoTable.finalY + 20, { align: 'center' });

  // Save the PDF
  const fileName = `tax-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
