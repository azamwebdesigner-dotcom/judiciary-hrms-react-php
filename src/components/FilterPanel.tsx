import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, X, RotateCcw } from 'lucide-react';
import { Headquarter, Tehsil, Designation, Category, Unit, Employee, EmploymentBlock } from '../types';

export interface ExtendedFilterState {
  // Location filters
  hqId: string;
  tehsilId: string;
  
  // Employee attributes
  gender: string;
  religion: string;
  domicile: string;
  
  // Date filters - DOB
  dobStart: string;
  dobEnd: string;
  
  // Date filters - DOA (Date of Appointment)
  doaStart: string;
  doaEnd: string;
  
  // Service status date filter (for "Since" date)
  statusDateStart: string;
  statusDateEnd: string;
  
  // Designation & BPS
  designationId: string;
  bps: string;
  
  // Posting info
  postingCategoryId: string;
  unitId: string;
  
  // Status
  status: string;
  
  // Leave filters
  hasActiveLeave: boolean;
  leaveType: string;
  
  // Disciplinary action filter
  hasDisciplinaryAction: boolean;
}

interface FilterPanelProps {
  filters: ExtendedFilterState;
  onFilterChange: (filters: ExtendedFilterState) => void;
  onClear: () => void;
  
  // Master data
  headquarters: Headquarter[];
  tehsils: Tehsil[];
  designations: Designation[];
  categories: Category[];
  units: Unit[];
  employees: Employee[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClear,
  headquarters,
  tehsils,
  designations,
  categories,
  units,
  employees,
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    location: true,
    employee: true,
    dates: false,
    employment: true,
    status: false,
    leave: false,
    disciplinary: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get associated tehsils for selected HQ
  const associatedTehsils = useMemo(() => {
    if (!filters.hqId) return [];
    return tehsils.filter((t) => t.hqId === filters.hqId);
  }, [filters.hqId, tehsils]);

  // Get all unique values from employees for various filters
  const uniqueGenders = useMemo(() => {
    const genders = new Set(employees.map((e) => e.gender).filter(Boolean));
    return Array.from(genders).sort();
  }, [employees]);

  const uniqueReligions = useMemo(() => {
    const religions = new Set(employees.map((e) => e.religion).filter(Boolean));
    return Array.from(religions).filter(Boolean) as string[];
  }, [employees]);

  const uniqueDomiciles = useMemo(() => {
    const domiciles = new Set(employees.map((e) => e.domicile).filter(Boolean));
    return Array.from(domiciles).filter(Boolean) as string[];
  }, [employees]);

  const uniqueBPS = useMemo(() => {
    const bps = new Set<string>();
    employees.forEach((e) => {
      e.employmentHistory?.forEach((eh) => {
        if (eh.bps) bps.add(eh.bps);
      });
    });
    return Array.from(bps).sort((a, b) => {
      const aNum = parseInt(a.replace('BPS-', ''));
      const bNum = parseInt(b.replace('BPS-', ''));
      return aNum - bNum;
    });
  }, [employees]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    employees.forEach((e) => {
      e.employmentHistory?.forEach((eh) => {
        if (eh.status) statuses.add(eh.status);
      });
    });
    return Array.from(statuses).sort();
  }, [employees]);

  const leaveTypes = useMemo(() => {
    const types = new Set<string>();
    employees.forEach((e) => {
      e.employmentHistory?.forEach((eh) => {
        eh.leaves?.forEach((leave) => {
          if (leave.type) types.add(leave.type);
        });
      });
    });
    return Array.from(types).sort();
  }, [employees]);

  const handleChange = (updates: Partial<ExtendedFilterState>) => {
    onFilterChange({ ...filters, ...updates });
  };

  const hasActiveFilters = Object.values(filters).some((val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val !== '';
    return false;
  });

  const FilterSection: React.FC<{
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }> = ({ title, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];
    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
        >
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </button>
        {isExpanded && <div className="px-4 py-3 bg-gray-50 space-y-3">{children}</div>}
      </div>
    );
  };

  const FilterInput: React.FC<{
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }> = ({ label, type = 'text', value, onChange, placeholder }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-judiciary-500"
      />
    </div>
  );

  const FilterSelect: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ label: string; value: string }>;
  }> = ({ label, value, onChange, options }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-judiciary-500"
      >
        <option value="">All Options</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in slide-in-from-top-2">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-judiciary-600 to-judiciary-700 text-white flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Advanced Filters</h2>
          <p className="text-sm text-judiciary-100">Narrow down employee data with multiple filter options</p>
        </div>
        <button
          onClick={onClear}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            hasActiveFilters
              ? 'bg-white text-judiciary-600 hover:bg-gray-100'
              : 'bg-judiciary-500 text-white opacity-50 cursor-not-allowed'
          }`}
          disabled={!hasActiveFilters}
        >
          <RotateCcw size={16} />
          Clear All
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Location Filters */}
        <FilterSection title="📍 Location" sectionKey="location">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FilterSelect
              label="Headquarters"
              value={filters.hqId}
              onChange={(value) =>
                handleChange({
                  hqId: value,
                  tehsilId: '', // Reset tehsil when HQ changes
                })
              }
              options={headquarters.map((hq) => ({
                label: hq.title,
                value: hq.id,
              }))}
            />
            <FilterSelect
              label="Tehsil"
              value={filters.tehsilId}
              onChange={(value) => handleChange({ tehsilId: value })}
              options={associatedTehsils.map((t) => ({
                label: t.title,
                value: t.id,
              }))}
            />
          </div>
          <div>
            <FilterSelect
              label="Posting Place Category"
              value={filters.postingCategoryId}
              onChange={(value) => handleChange({ postingCategoryId: value })}
              options={categories.map((c) => ({
                label: c.title,
                value: c.id,
              }))}
            />
          </div>
          <div>
            <FilterSelect
              label="Unit / Court"
              value={filters.unitId}
              onChange={(value) => handleChange({ unitId: value })}
              options={units.map((u) => ({
                label: u.title,
                value: u.id,
              }))}
            />
          </div>
        </FilterSection>

        {/* Employee Attributes */}
        <FilterSection title="👤 Employee Attributes" sectionKey="employee">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FilterSelect
              label="Gender"
              value={filters.gender}
              onChange={(value) => handleChange({ gender: value })}
              options={uniqueGenders.map((g) => ({
                label: g,
                value: g,
              }))}
            />
            <FilterSelect
              label="Religion / Sect"
              value={filters.religion}
              onChange={(value) => handleChange({ religion: value })}
              options={uniqueReligions.map((r) => ({
                label: r,
                value: r,
              }))}
            />
            <FilterSelect
              label="Domicile"
              value={filters.domicile}
              onChange={(value) => handleChange({ domicile: value })}
              options={uniqueDomiciles.map((d) => ({
                label: d,
                value: d,
              }))}
            />
          </div>
        </FilterSection>

        {/* Date Range Filters */}
        <FilterSection title="📅 Date Filters" sectionKey="dates">
          <div className="space-y-4">
            {/* DOB Range */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                Date of Birth (DOB) Range
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FilterInput
                  label="From"
                  type="date"
                  value={filters.dobStart}
                  onChange={(value) => handleChange({ dobStart: value })}
                  placeholder="YYYY-MM-DD"
                />
                <FilterInput
                  label="To"
                  type="date"
                  value={filters.dobEnd}
                  onChange={(value) => handleChange({ dobEnd: value })}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            {/* DOA Range */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                Date of Appointment (DOA) Range
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FilterInput
                  label="From"
                  type="date"
                  value={filters.doaStart}
                  onChange={(value) => handleChange({ doaStart: value })}
                  placeholder="YYYY-MM-DD"
                />
                <FilterInput
                  label="To"
                  type="date"
                  value={filters.doaEnd}
                  onChange={(value) => handleChange({ doaEnd: value })}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            {/* Status Date Range (Since Date) */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                Service Status Date (Since Date) Range
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                Filter by most recent in-service or status change date
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FilterInput
                  label="From"
                  type="date"
                  value={filters.statusDateStart}
                  onChange={(value) => handleChange({ statusDateStart: value })}
                  placeholder="YYYY-MM-DD"
                />
                <FilterInput
                  label="To"
                  type="date"
                  value={filters.statusDateEnd}
                  onChange={(value) => handleChange({ statusDateEnd: value })}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Employment Details */}
        <FilterSection title="💼 Employment Details" sectionKey="employment">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FilterSelect
              label="Designation"
              value={filters.designationId}
              onChange={(value) => handleChange({ designationId: value })}
              options={designations.map((d) => ({
                label: d.title,
                value: d.id,
              }))}
            />
            <FilterSelect
              label="BPS Grade"
              value={filters.bps}
              onChange={(value) => handleChange({ bps: value })}
              options={uniqueBPS.map((b) => ({
                label: b,
                value: b,
              }))}
            />
          </div>
        </FilterSection>

        {/* Status Filters */}
        <FilterSection title="🎯 Status" sectionKey="status">
          <div>
            <FilterSelect
              label="Employment Status"
              value={filters.status}
              onChange={(value) => handleChange({ status: value })}
              options={uniqueStatuses.map((s) => ({
                label: s,
                value: s,
              }))}
            />
          </div>
          <div className="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded">
            Status includes: In-Service, Retired, Resigned, Deceased, Terminated, Suspended, OSD, Deputation, Absent, Remove
          </div>
        </FilterSection>

        {/* Leave Filters */}
        <FilterSection title="🏥 Leave" sectionKey="leave">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasActiveLeave}
                onChange={(e) => handleChange({ hasActiveLeave: e.target.checked })}
                className="w-4 h-4 text-judiciary-600 border-gray-300 rounded focus:ring-judiciary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show only employees with active leaves
              </span>
            </label>
          </div>
          {filters.hasActiveLeave && (
            <div className="mt-3">
              <FilterSelect
                label="Leave Type"
                value={filters.leaveType}
                onChange={(value) => handleChange({ leaveType: value })}
                options={leaveTypes.map((lt) => ({
                  label: lt,
                  value: lt,
                }))}
              />
            </div>
          )}
        </FilterSection>

        {/* Disciplinary Action Filters */}
        <FilterSection title="⚖️ Disciplinary Actions" sectionKey="disciplinary">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasDisciplinaryAction}
              onChange={(e) => handleChange({ hasDisciplinaryAction: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Show only employees with disciplinary actions
            </span>
          </label>
          <div className="text-xs text-gray-600 mt-2 p-2 bg-red-50 rounded">
            Filter to identify employees who have been subject to disciplinary inquiries or actions
          </div>
        </FilterSection>
      </div>

      {/* Footer with active filter count */}
      {hasActiveFilters && (
        <div className="px-6 py-3 bg-judiciary-50 border-t border-gray-200 text-xs text-judiciary-700 font-medium">
          {Object.values(filters).filter((val) => {
            if (typeof val === 'boolean') return val;
            if (typeof val === 'string') return val !== '';
            return false;
          }).length}{' '}
          filter(s) active
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
