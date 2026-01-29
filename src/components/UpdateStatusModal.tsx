import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge'; // Updated import to use default export

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: string, effectiveDate: string, notes: string) => Promise<void>;
  currentStatus?: string;
  employeeName: string;
  isLoading?: boolean;
  statusDate?: string; // Added statusDate prop
}

const statusOptions = [
  'Active',
  'On Leave',
  'Inactive',
  'Terminated',
  'Retired',
  'Suspended',
  'OSD',
  'Deputation',
  'Absent',
  'Remove'
];

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentStatus = 'Active',
  employeeName,
  isLoading = false,
  statusDate = new Date().toISOString().split('T')[0] // Default to today's date
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [effectiveDate, setEffectiveDate] = useState(
    statusDate || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setStatus(currentStatus);
    if (statusDate) {
      setEffectiveDate(statusDate);
    }
  }, [currentStatus, statusDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors: { [key: string]: string } = {};
    if (!status) validationErrors.status = 'Status is required';
    if (!effectiveDate) validationErrors.effectiveDate = 'Effective date is required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await onSave(status, effectiveDate, notes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Update Employee Status</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Employee</p>
            <div className="flex items-center justify-between">
              <p className="font-medium">{employeeName}</p>
              <StatusBadge
                status={currentStatus}
                statusDate={statusDate}
                className="ml-2"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full p-2 border rounded-md ${errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                disabled={isLoading}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                min="1900-01-01"
                max="3099-12-31"
                onChange={(e) => setEffectiveDate(e.target.value)}
                className={`w-full p-2 border rounded-md ${errors.effectiveDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                disabled={isLoading}
              />
              {errors.effectiveDate && (
                <p className="mt-1 text-sm text-red-600">{errors.effectiveDate}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                disabled={isLoading}
                placeholder="Add any notes about this status change..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;