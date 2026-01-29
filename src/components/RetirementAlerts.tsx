import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Users } from 'lucide-react';

interface RetirementAlertEmployee {
  id: string;
  fullName: string;
  photoPath?: string;
  dateOfBirth: string;
  retirementDate: string;
  daysToRetirement: number;
  retirementStatus: 'critical' | 'warning' | 'normal';
  designation: string;
  bps: string;
  postingPlaceTitle: string;
  status: string;
  hqName: string;
  tehsilName: string;
}

interface RetirementAlertsProps {
  employees: RetirementAlertEmployee[];
  threshold: number;
  loading: boolean;
}

export const RetirementAlerts: React.FC<RetirementAlertsProps> = ({
  employees,
  threshold,
  loading
}) => {
  const [filteredEmployees, setFilteredEmployees] = useState<RetirementAlertEmployee[]>([]);
  const [viewMode, setViewMode] = useState<'critical' | 'warning' | 'all'>('critical');

  useEffect(() => {
    let filtered = employees;
    
    if (viewMode === 'critical') {
      filtered = employees.filter(e => e.retirementStatus === 'critical');
    } else if (viewMode === 'warning') {
      filtered = employees.filter(e => e.retirementStatus === 'warning');
    }
    
    setFilteredEmployees(filtered);
  }, [employees, viewMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-green-50 border-green-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Retirement Alerts</h3>
              <p className="text-sm text-gray-600">Employees retiring within {threshold} months</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{filteredEmployees.length}</div>
            <div className="text-xs text-gray-600">Need Attention</div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('critical')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              viewMode === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Critical ({employees.filter(e => e.retirementStatus === 'critical').length})
          </button>
          <button
            onClick={() => setViewMode('warning')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              viewMode === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Warning ({employees.filter(e => e.retirementStatus === 'warning').length})
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              viewMode === 'all'
                ? 'bg-judiciary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({employees.length})
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-96">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading retirement data...</div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <Clock size={32} className="mb-2 text-gray-400" />
            <p className="text-sm">No employees in this category</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredEmployees.map(emp => {
              const monthsToRetirement = Math.ceil(emp.daysToRetirement / 30);
              return (
                <div
                  key={emp.id}
                  className={`p-4 border-l-4 transition hover:bg-gray-50 ${
                    emp.retirementStatus === 'critical'
                      ? 'border-l-red-600'
                      : emp.retirementStatus === 'warning'
                      ? 'border-l-yellow-500'
                      : 'border-l-green-500'
                  }`}
                >
                  <div className="flex gap-4">
                    {emp.photoPath && (
                      <img
                        src={emp.photoPath}
                        alt={emp.fullName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h4 className="font-semibold text-gray-800">{emp.fullName}</h4>
                          <p className="text-xs text-gray-500">{emp.designation}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusBadgeColor(emp.retirementStatus)}`}>
                          {emp.retirementStatus.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div>
                          <span className="text-gray-500">Posting:</span> {emp.postingPlaceTitle}
                        </div>
                        <div>
                          <span className="text-gray-500">BPS:</span> {emp.bps}
                        </div>
                        <div>
                          <span className="text-gray-500">Retirement Date:</span>{' '}
                          <span className="font-medium">{new Date(emp.retirementDate).toLocaleDateString()}</span>
                        </div>
                        <div className="font-semibold">
                          ⏱️ {monthsToRetirement} month{monthsToRetirement !== 1 ? 's' : ''} remaining
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetirementAlerts;
