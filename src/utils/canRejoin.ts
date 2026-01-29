import { Employee, EmploymentBlock } from '../types';

export const REJOINABLE_STATUSES = [
  'Resigned',
  'Terminated',
  'OSD',
  'Suspended',
  'Deputation',
  'Absent',
  'Remove'
];

export const TERMINAL_STATUSES = ['Retired', 'Deceased'];

const normalize = (s?: string) => (s || '').toString().trim().toLowerCase();

export function isRejoinableStatus(status?: string): boolean {
  if (!status) return false;
  const n = normalize(status);
  return REJOINABLE_STATUSES.some(rs => normalize(rs) === n);
}

export function isTerminalStatus(status?: string): boolean {
  if (!status) return false;
  const n = normalize(status);
  return TERMINAL_STATUSES.some(ts => normalize(ts) === n);
}

function getMostRecentBlock(blocks: EmploymentBlock[] = []): EmploymentBlock | null {
  if (!blocks || blocks.length === 0) return null;

  // Prefer blocks with statusDate, then toDate, then fromDate
  const copy = [...blocks].filter(Boolean);
  copy.sort((a, b) => {
    const getTime = (blk: EmploymentBlock) => {
      const date = blk.statusDate || blk.toDate || blk.fromDate || '';
      const t = new Date(date).getTime();
      return isNaN(t) ? 0 : t;
    };
    return getTime(b) - getTime(a);
  });
  return copy[0] || null;
}

export function canEmployeeRejoin(emp?: Employee | null): boolean {
  if (!emp) return false;

  // If employee has an employment history, inspect the most recent block
  const latest = getMostRecentBlock(emp.employmentHistory || []);
  const lastStatus = latest?.status || '';

  // If terminal status, cannot rejoin
  if (isTerminalStatus(lastStatus)) return false;

  // If most recent status is one of the rejoinable statuses, allow rejoin
  if (isRejoinableStatus(lastStatus)) return true;

  // Fallback: consider top-level employee.status (e.g., Active/Inactive/Suspended/Retired)
  const top = (emp.status || '').toString().trim().toLowerCase();
  if (!top) return false;
  if (top === 'active') return false;
  if (top === 'retired' || top === 'inactive') return false;

  // If top-level status is 'suspended' allow rejoin only if last block shows suspended
  if (top === 'suspended' && isRejoinableStatus(lastStatus)) return true;

  return false;
}

export default canEmployeeRejoin;
