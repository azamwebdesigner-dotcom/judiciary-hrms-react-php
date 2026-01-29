import React, { useMemo } from 'react';
import { Employee } from '../types';
import { useMasterData } from '../context/MasterDataContext';

interface Props {
  selectedEmployees: Employee[];
  onClear?: () => void;
}

const SelectionActions: React.FC<Props> = ({ selectedEmployees, onClear }) => {
  const { designations, units, categories } = useMasterData();

  if (!selectedEmployees || selectedEmployees.length === 0) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '0000-00-00') return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB');
  };

  const calculateDuration = (fromDateStr: string, toDateStr?: string | null) => {
    if (!fromDateStr) return '-';
    const start = new Date(fromDateStr);
    let end = new Date();
    if (toDateStr && toDateStr !== '0000-00-00') end = new Date(toDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }

    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0) parts.push(`${days}d`);
    return parts.length === 0 ? '0d' : parts.join(' ');
  };

  const getEmployeeRowData = (emp: Employee) => {
    const latest = emp.employmentHistory?.[0];
    if (!latest) return null;

    const doa = emp.dateOfAppointment ? formatDate(emp.dateOfAppointment) : '';
    const designationTitle = designations.find(d => String(d.id) === String(latest.designationId))?.title || latest.designationId || '';
    const unitTitle = units.find(u => String(u.id) === String(latest.unitId))?.title || latest.unitId || '';
    const categoryTitle = categories.find(c => String(c.id) === String(latest.postingCategoryId))?.title || latest.postingCategoryId || '';
    const postingInfo = [latest.postingPlaceTitle, unitTitle, categoryTitle].filter(Boolean).join(' - ');
    const fromDate = formatDate(latest.fromDate);
    const duration = calculateDuration(latest.fromDate, latest.toDate);

    return {
      fullName: emp.fullName,
      fatherName: emp.fatherName || '',
      cnic: emp.cnic,
      doa,
      designationTitle,
      postingInfo,
      fromDate,
      duration
    };
  };

  const printSelected = () => {
    // console.log('Print button clicked, selectedEmployees:', selectedEmployees.length);

    const cols = ['Full Name', 'Father Name', 'CNIC', 'DOA', 'Designation', 'Posting Place', 'From Date', 'Duration'];
    const tableRows: string[] = [];

    selectedEmployees.forEach((emp, idx) => {
      try {
        const latest = emp.employmentHistory?.[0];
        if (!latest) {
          console.warn(`Employee ${idx} has no employment history`);
          return;
        }

        const doa = emp.dateOfAppointment ? formatDate(emp.dateOfAppointment) : '';
        const designationTitle = designations.find(d => String(d.id) === String(latest.designationId))?.title || latest.designationId || '';
        const unitTitle = units.find(u => String(u.id) === String(latest.unitId))?.title || latest.unitId || '';
        const categoryTitle = categories.find(c => String(c.id) === String(latest.postingCategoryId))?.title || latest.postingCategoryId || '';
        const postingInfo = [latest.postingPlaceTitle, unitTitle, categoryTitle].filter(Boolean).join(' - ');
        const fromDate = formatDate(latest.fromDate);
        const duration = calculateDuration(latest.fromDate, latest.toDate);

        const rowData = [
          emp.fullName || '',
          emp.fatherName || '',
          emp.cnic || '',
          doa || '',
          designationTitle || '',
          postingInfo || '',
          fromDate || '',
          duration || ''
        ];

        const rowHtml = `<tr>${rowData.map(cell => `<td>${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`;
        tableRows.push(rowHtml);
      } catch (err) {
        console.error(`Error processing employee ${idx}:`, err);
      }
    });
    // console.log(`Generated ${tableRows.length} rows for print`);

    if (tableRows.length === 0) {
      alert('No employee data available to print. Please check if employees have employment history.');
      return;
    }

    // Judiciary Logo SVG
    const judiciarySvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cstyle%3E.logo-text%7Bfont-size:24px;font-weight:bold;text-anchor:middle;fill:%23333;%7D%3C/style%3E%3C/defs%3E%3Ccircle cx='100' cy='100' r='95' fill='none' stroke='%23666' stroke-width='2'/%3E%3Cpath d='M 100 30 L 120 70 L 160 70 L 130 95 L 145 135 L 100 110 L 55 135 L 70 95 L 40 70 L 80 70 Z' fill='%23d4af37' stroke='%23d4af37'/%3E%3Ctext x='100' y='160' class='logo-text'%3EJUDICIARY%3C/text%3E%3C/svg%3E`;

    const style = `
      * { margin: 0; padding: 0; }
      body { 
        font-family: Arial, sans-serif; 
        padding: 20px; 
        background-color: #fff;
        position: relative;
      }
      .watermark-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 400px;
        opacity: 0.08;
        z-index: 0;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .watermark-container img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .content {
        position: relative;
        z-index: 1;
      }
      h2 { 
        margin-bottom: 10px; 
        font-size: 20px;
        color: #1a202c;
      }
      .header-info {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e2e8f0;
      }
      .report-title {
        font-size: 16px;
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 5px;
      }
      .report-date {
        font-size: 12px;
        color: #718096;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        font-size: 11px;
        margin-top: 20px;
      }
      th, td { 
        border: 1px solid #cbd5e0; 
        padding: 10px; 
        text-align: left; 
      }
      th { 
        background: #2d3748; 
        color: white; 
        font-weight: bold;
      }
      tr:nth-child(even) { 
        background: #f7fafc; 
      }
      tr:hover {
        background: #edf2f7;
      }
      @media print {
        body { 
          padding: 10px; 
          margin: 0;
        }
        .watermark-container {
          opacity: 0.05;
        }
        table { 
          font-size: 10px;
        }
        th, td { 
          padding: 8px; 
        }
      }
    `;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Employee Report</title>
<style>${style}</style>
</head>
<body>
<div class="watermark-container">
  <img src="${judiciarySvg}" alt="Judiciary Logo">
</div>
<div class="content">
  <div class="header-info">
    <div class="report-title">EMPLOYEE REPORT</div>
    <div class="report-date">
      Total Records: ${selectedEmployees.length} | Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}
    </div>
  </div>
  <table>
    <thead>
      <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${tableRows.join('\n')}
    </tbody>
  </table>
</div>
</body>
</html>`;

    try {
      const win = window.open('', '_blank');
      if (!win) {
        alert('Popup was blocked. Please allow popups and try again.');
        return;
      }
      win.document.write(html);
      win.document.close();
      // console.log('Document written to new window with judiciary logo watermark');

      setTimeout(() => {
        try {
          win.print();
        } catch (e) {
          console.error('Print failed:', e);
        }
      }, 800);
    } catch (err) {
      console.error('Error opening print window:', err);
      alert('Failed to open print window. Check browser console for details.');
    }
  };

  const downloadCsv = () => {
    const header = ['Full Name', 'Father Name', 'CNIC', 'DOA', 'Designation', 'Posting Place', 'From Date', 'Duration'];
    const lines = [header.join(',')];
    selectedEmployees.forEach(emp => {
      const data = getEmployeeRowData(emp);
      if (!data) return;
      const row = [
        escapeCsv(data.fullName),
        escapeCsv(data.fatherName),
        escapeCsv(data.cnic),
        escapeCsv(data.doa),
        escapeCsv(data.designationTitle),
        escapeCsv(data.postingInfo),
        escapeCsv(data.fromDate),
        escapeCsv(data.duration)
      ];
      lines.push(row.join(','));
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const escapeCsv = (val: string) => {
    if (val == null) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
      <div className="text-sm text-gray-700">{selectedEmployees.length} selected</div>
      <div className="flex items-center gap-2">
        <button onClick={printSelected} className="px-3 py-2 bg-white border rounded hover:bg-gray-50 text-sm">Print Selected</button>
        <button onClick={downloadCsv} className="px-3 py-2 bg-judiciary-600 text-white rounded hover:bg-judiciary-700 text-sm">Download CSV</button>
        {onClear && <button onClick={onClear} className="px-3 py-2 bg-red-50 text-red-700 border rounded text-sm">Clear</button>}
      </div>
    </div>
  );
};

export default SelectionActions;
