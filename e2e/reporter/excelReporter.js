import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Test Results');

// Define columns
worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Test Suite', key: 'suite', width: 30 },
    { header: 'Test Case Name', key: 'name', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Error Message', key: 'error', width: 50 },
    { header: 'Suggested Fix / Action Required', key: 'suggestedFix', width: 60 }
];

// Style headers
worksheet.getRow(1).font = { bold: true };
worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
};

let testCount = 0;

export const addTestResult = (suite, name, status, duration, error = '', suggestedFix = '') => {
    testCount++;
    const row = worksheet.addRow({
        id: testCount,
        suite: suite,
        name: name,
        status: status,
        duration: duration,
        error: error,
        suggestedFix: suggestedFix
    });

    // Color code status
    const statusCell = row.getCell('status');
    const fixCell = row.getCell('suggestedFix');
    if (status === 'passed') {
        statusCell.font = { color: { argb: 'FF008000' } }; // Green
    } else if (status === 'failed') {
        statusCell.font = { color: { argb: 'FFFF0000' } }; // Red
        fixCell.font = { bold: true, color: { argb: 'FFCC0000' } }; // Highlight fixes
    }
};

export const saveReport = async () => {
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }
    const reportPath = path.join(reportsDir, 'TestReport_Genuine.xlsx');
    await workbook.xlsx.writeFile(reportPath);
    console.log(`Excel report saved to: ${reportPath}`);
};
