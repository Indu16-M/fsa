import ExcelJS from 'exceljs';
import path from 'path';

export async function generateExcelReport(results, outputPath = 'appium_test_report.xlsx') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FoodShare AI Appium Mobile Automation Engine';
  workbook.created = new Date();

  // 1. EXECUTIVE SUMMARY SHEET
  const summarySheet = workbook.addWorksheet('Appium Mobile Summary');
  
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 32 },
    { header: 'Value', key: 'value', width: 42 }
  ];

  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASSED').length;
  const failedTests = results.filter(r => r.status === 'FAILED').length;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%';
  const totalDuration = results.reduce((acc, r) => acc + (r.durationMs || 0), 0);

  summarySheet.addRows([
    { metric: 'Target Application', value: 'FoodShare AI React Native Android App (mobile/App.js)' },
    { metric: 'Execution Timestamp', value: new Date().toLocaleString() },
    { metric: 'Total Executed Test Cases', value: totalTests },
    { metric: 'Passed Test Cases', value: passedTests },
    { metric: 'Failed Test Cases', value: failedTests },
    { metric: 'Overall Mobile Pass Rate', value: passRate },
    { metric: 'Total Suite Execution Time (ms)', value: `${totalDuration} ms` },
    { metric: 'Automation Framework', value: 'Node.js + Appium / WebDriverIO Engine' },
    { metric: 'Platform Target', value: 'Android OS / React Native Mobile Architecture' }
  ]);

  // Style Header Row for Summary Sheet
  summarySheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '111827' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  summarySheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.getCell(1).font = { bold: true };
      if (row.getCell(1).value === 'Overall Mobile Pass Rate') {
        row.getCell(2).font = { bold: true, color: { argb: '10B981' } };
      }
    }
  });

  // 2. DETAILED TEST MATRIX SHEET
  const detailSheet = workbook.addWorksheet('Mobile Test Matrix');

  detailSheet.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Module Name', key: 'module', width: 28 },
    { header: 'Test Case Description', key: 'description', width: 45 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Target Mobile Screen', key: 'targetUrl', width: 26 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Duration (ms)', key: 'durationMs', width: 16 },
    { header: 'Execution Timestamp', key: 'timestamp', width: 22 },
    { header: 'Verification Notes', key: 'notes', width: 42 }
  ];

  results.forEach(r => {
    detailSheet.addRow({
      id: r.id,
      module: r.module,
      description: r.description,
      category: r.category,
      targetUrl: r.targetUrl,
      status: r.status,
      durationMs: r.durationMs,
      timestamp: r.timestamp || new Date().toISOString(),
      notes: r.notes || 'Verified successfully on Android container'
    });
  });

  // Style Header Row for Matrix Sheet
  detailSheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F2937' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Style Status Cells
  detailSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const statusCell = row.getCell('status');
      if (statusCell.value === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
        statusCell.font = { color: { argb: '065F46' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        statusCell.font = { color: { argb: '991B1B' }, bold: true };
      }
    }
  });

  await workbook.xlsx.writeFile(outputPath);
  console.log(`\n📊 Excel Report generated successfully at: ${path.resolve(outputPath)}`);
}
