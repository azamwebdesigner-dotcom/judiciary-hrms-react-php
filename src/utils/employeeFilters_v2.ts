import { Employee, EmploymentBlock } from '../types';

export interface FilterOptions {
  query?: string; // name or CNIC
  status?: Array<string> | string;
  categoryId?: string | string[];
  designationId?: string | string[];
  unitId?: string | string[];
  postingPlace?: string | string[]; // fuzzy contains matching
  hqId?: string | string[];
  tehsilId?: string | string[];
  gender?: string | string[];
  domicile?: string | string[];
  sect?: string | string[];
  bpsGrade?: string | string[]; // e.g. "BPS-11" or "11"

  dobFrom?: string;
  dobTo?: string;
  doaFrom?: string;
  doaTo?: string;
  statusDateFrom?: string;
  statusDateTo?: string;

  activeLeaveOnly?: boolean; // leave that overlaps today

  sinceDate?: string; // include employees whose current employment started on/after this date

  // Leave filtering by type and date range
  leaveType?: string | string[]; // specific leave type (e.g., "Medical Leave", "Earned Leave")
  leaveFromDate?: string; // leaves that started on or after this date
  leaveToDate?: string; // leaves that ended on or before this date

  // Disciplinary action date range filtering
  disciplinaryFromDate?: string; // disciplinary actions on or after this date
  disciplinaryToDate?: string; // disciplinary actions on or before this date
}

function parseDate(d?: string | null) {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t);
}

function inRange(dateStr?: string, from?: string, to?: string) {
  const d = parseDate(dateStr);
  if (!d) return false;
  const f = parseDate(from);
  const t = parseDate(to);
  if (f && d < f) return false;
  if (t && d > t) return false;
  return true;
}

function normalize(s?: string) {
  return (s || '').toString().toLowerCase().trim();
}

function getCurrentBlock(emp: Employee): EmploymentBlock | null {
  if (!emp.employmentHistory || emp.employmentHistory.length === 0) return null;
  const current = emp.employmentHistory.find((b) => b.isCurrentlyWorking);
  if (current) return current;
  const sorted = [...emp.employmentHistory].sort((a, b) => {
    const ad = Date.parse(a.fromDate || '');
    const bd = Date.parse(b.fromDate || '');
    return bd - ad;
  });
  return sorted[0] || null;
}

export function filterEmployeesV2(employees: Employee[], opts: FilterOptions): Employee[] {
  if (!Array.isArray(employees) || employees.length === 0) return [];
  const q = normalize(opts.query);

  // Only set statusSet if status filter is actually provided (not empty string)
  let statusSet: string[] | null = null;
  if (opts.status) {
    if (Array.isArray(opts.status)) {
      statusSet = opts.status.map(s => normalize(s)).filter(s => s);
    } else {
      const normalized = normalize(opts.status);
      statusSet = normalized ? [normalized] : null;
    }
  }

  return employees.filter((emp) => {
    // search by name or CNIC (accept digits-only CNIC search)
    if (q) {
      const hay = [emp.fullName, emp.cnic, emp.fatherName].map(normalize).join(' ');
      const cnicDigits = (emp.cnic || '').replace(/[^0-9]/g, '');
      const qDigits = q.replace(/[^0-9]/g, '');
      if (!(hay.includes(q) || (qDigits && cnicDigits.includes(qDigits)))) return false;
    }

    // basic scalar filters (only apply if actually provided)
    if (opts.gender) {
      if (Array.isArray(opts.gender)) {
        if (!opts.gender.some(g => normalize(g) === normalize(emp.gender))) return false;
      } else if (normalize(emp.gender) !== normalize(opts.gender)) return false;
    }
    if (opts.domicile) {
      if (Array.isArray(opts.domicile)) {
        if (!opts.domicile.some(d => normalize(d) === normalize(emp.domicile))) return false;
      } else if (normalize(emp.domicile) !== normalize(opts.domicile)) return false;
    }
    if (opts.sect) {
      if (Array.isArray(opts.sect)) {
        if (!opts.sect.some(s => normalize(s) === normalize((emp as any).sect))) return false;
      } else if (normalize((emp as any).sect) !== normalize(opts.sect)) return false;
    }

    // employee-level date ranges
    if (opts.dobFrom || opts.dobTo) {
      if (!inRange(emp.dob, opts.dobFrom, opts.dobTo)) return false;
    }
    if (opts.doaFrom || opts.doaTo) {
      if (!inRange(emp.dateOfAppointment, opts.doaFrom, opts.doaTo)) return false;
    }

    const block = getCurrentBlock(emp);

    // If block-level filters are requested but no block exists, skip
    const needsBlock = opts.hqId || opts.tehsilId || opts.designationId || opts.unitId || opts.categoryId || opts.postingPlace || opts.bpsGrade;
    if (needsBlock && !block) return false;

    // status matching: consider employee.status and current block.status
    if (statusSet && statusSet.length > 0) {
      const sEmp = normalize(emp.status || '');
      const sBlock = normalize(block?.status || '');
      const mapped = [sEmp, sBlock].filter(s => s);
      if (mapped.length === 0) return false; // No status to match
      const matches = statusSet.some(st => mapped.some(m => m === st || m.includes(st) || st.includes(m)));
      if (!matches) return false;
    }

    if (opts.statusDateFrom || opts.statusDateTo) {
      const statusDate = block?.statusDate || emp.updatedAt || '';
      if (!inRange(statusDate, opts.statusDateFrom, opts.statusDateTo)) return false;
    }

    // HQ/Tehsil (only apply if provided)
    if (opts.hqId) {
      if (Array.isArray(opts.hqId)) {
        if (!opts.hqId.some(id => String(id).trim() === String(block!.hqId).trim())) return false;
      } else if (String(block!.hqId).trim() !== String(opts.hqId).trim()) return false;
    }
    if (opts.tehsilId) {
      if (Array.isArray(opts.tehsilId)) {
        if (!opts.tehsilId.some(id => String(id).trim() === String(block!.tehsilId).trim())) return false;
      } else if (String(block!.tehsilId).trim() !== String(opts.tehsilId).trim()) return false;
    }

    // designation/unit/category (only apply if provided)
    if (opts.designationId) {
      if (Array.isArray(opts.designationId)) {
        if (!opts.designationId.some(id => String(id).trim() === String(block!.designationId).trim())) return false;
      } else if (String(block!.designationId).trim() !== String(opts.designationId).trim()) return false;
    }
    if (opts.unitId) {
      if (Array.isArray(opts.unitId)) {
        if (!opts.unitId.some(id => String(id).trim() === String(block!.unitId).trim())) return false;
      } else if (String(block!.unitId).trim() !== String(opts.unitId).trim()) return false;
    }
    if (opts.categoryId) {
      if (Array.isArray(opts.categoryId)) {
        if (!opts.categoryId.some(id => String(id).trim() === String(block!.postingCategoryId).trim())) return false;
      } else if (String(block!.postingCategoryId).trim() !== String(opts.categoryId).trim()) return false;
    }

    // posting place: fuzzy contains (only apply if provided)
    if (opts.postingPlace) {
      if (Array.isArray(opts.postingPlace)) {
        if (!opts.postingPlace.some(p => normalize(block!.postingPlaceTitle).includes(normalize(p)))) return false;
      } else if (!normalize(block!.postingPlaceTitle).includes(normalize(opts.postingPlace))) return false;
    }

    // BPS grade fuzzy match (accept '11' or 'BPS-11') - only apply if provided
    if (opts.bpsGrade) {
      const bp = normalize(block!.bps || '');
      const bpDigits = bp.replace(/[^0-9]/g, '');

      if (Array.isArray(opts.bpsGrade)) {
        const matches = opts.bpsGrade.some(bg => {
          const want = normalize(bg || '').replace(/bps-?/g, '');
          const wantDigits = want.replace(/[^0-9]/g, '');
          return bpDigits.includes(wantDigits);
        });
        if (!matches) return false;
      } else {
        const want = normalize(opts.bpsGrade || '').replace(/bps-?/g, '');
        const wantDigits = want.replace(/[^0-9]/g, '');
        if (!bpDigits.includes(wantDigits)) return false;
      }
    }

    // sinceDate: include employees whose current employment fromDate is on/after opts.sinceDate
    if (opts.sinceDate) {
      const since = parseDate(opts.sinceDate);
      if (since) {
        const from = parseDate(block?.fromDate || emp.createdAt || '');
        if (!from) return false;
        if (from < since) return false; // exclude those who started before since
      }
    }

    if (opts.activeLeaveOnly) {
      const now = new Date();
      const active = emp.employmentHistory.some((b) => (b.leaves || []).some(l => {
        const s = parseDate(l.startDate);
        const e = parseDate(l.endDate);
        if (!s) return false;
        if (e) return s <= now && now <= e;
        return s <= now;
      }));
      if (!active) return false;
    }

    // LEAVE TYPE AND DATE RANGE FILTERING
    // Filter by specific leave type if provided
    if (opts.leaveType || opts.leaveFromDate || opts.leaveToDate) {
      const leaveFromDate = parseDate(opts.leaveFromDate);
      const leaveToDate = parseDate(opts.leaveToDate);

      // Check if employee has any leave matching the criteria
      const hasMatchingLeave = emp.employmentHistory.some((b) => {
        if (!Array.isArray(b.leaves) || b.leaves.length === 0) return false;

        return (b.leaves || []).some(leave => {
          // Filter by leave type if specified
          if (opts.leaveType) {
            if (Array.isArray(opts.leaveType)) {
              if (!opts.leaveType.some(lt => normalize(leave.type) === normalize(lt))) return false;
            } else if (normalize(leave.type) !== normalize(opts.leaveType)) {
              return false;
            }
          }

          // Check date range overlap:
          // Employee is on leave during the filter range if:
          // leave.startDate <= filterEndDate AND leave.endDate >= filterStartDate
          const leaveStart = parseDate(leave.startDate);
          const leaveEnd = parseDate(leave.endDate);

          if (!leaveStart) return false;

          // If no dates specified for filter, just check the type match
          if (!leaveFromDate && !leaveToDate) {
            return true;
          }

          // If only leaveFromDate specified, check if leave ends on or after that date
          if (leaveFromDate && !leaveToDate) {
            if (!leaveEnd) return leaveStart >= leaveFromDate; // ongoing leave
            return leaveEnd >= leaveFromDate;
          }

          // If only leaveToDate specified, check if leave starts on or before that date
          if (!leaveFromDate && leaveToDate) {
            return leaveStart <= leaveToDate;
          }

          // Both dates specified: check overlap
          if (leaveFromDate && leaveToDate) {
            if (!leaveEnd) {
              // Ongoing leave - check if it started before or during filter range
              return leaveStart <= leaveToDate;
            }
            // Check if leave period overlaps with filter range
            return leaveStart <= leaveToDate && leaveEnd >= leaveFromDate;
          }

          return true;
        });
      });

      if (!hasMatchingLeave) return false;
    }

    // DISCIPLINARY ACTION DATE RANGE FILTERING
    // Filter by disciplinary actions within the specified date range
    if (opts.disciplinaryFromDate || opts.disciplinaryToDate) {
      const disciplinaryFromDate = parseDate(opts.disciplinaryFromDate);
      const disciplinaryToDate = parseDate(opts.disciplinaryToDate);

      // console.log('🔍 Checking disciplinary for:', emp.fullName, 'Range:', opts.disciplinaryFromDate, 'to', opts.disciplinaryToDate);
      // console.log('📋 Employee history blocks:', emp.employmentHistory?.length);

      // Check if employee has any disciplinary action matching the criteria
      const hasMatchingDisciplinary = emp.employmentHistory.some((b) => {
        // console.log('  Block ID:', b.id, 'Disciplinary actions:', b.disciplinaryActions?.length || 0);
        if (!Array.isArray(b.disciplinaryActions) || b.disciplinaryActions.length === 0) return false;

        return (b.disciplinaryActions || []).some(action => {
          const actionDate = parseDate(action.actionDate);
          // console.log('    Action date:', action.actionDate, 'Parsed:', actionDate, 'Match:', actionDate && actionDate >= (disciplinaryFromDate || new Date(0)) && actionDate <= (disciplinaryToDate || new Date()));

          if (!actionDate) return false;

          // If only disciplinaryFromDate specified
          if (disciplinaryFromDate && !disciplinaryToDate) {
            return actionDate >= disciplinaryFromDate;
          }

          // If only disciplinaryToDate specified
          if (!disciplinaryFromDate && disciplinaryToDate) {
            return actionDate <= disciplinaryToDate;
          }

          // Both dates specified: check if action falls within range
          if (disciplinaryFromDate && disciplinaryToDate) {
            return actionDate >= disciplinaryFromDate && actionDate <= disciplinaryToDate;
          }

          return true;
        });
      });

      if (!hasMatchingDisciplinary) return false;
    }

    return true;
  });
}

export default filterEmployeesV2;
