import React, { useMemo } from 'react';
import { Clock, CheckCircle, XCircle, Clock as ClockIcon, HelpCircle, AlertCircle, UserCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  statusDate?: string | null;
  date?: string | null;
  isActive?: boolean;
  isTerminal?: boolean;
  canRejoin?: boolean;
  isOnLeave?: boolean;
  onRejoin?: () => void;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  'In-Service': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  'Active': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  'Inactive': {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: <ClockIcon className="w-3 h-3" />,
  },
  'On Leave': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: <Clock className="w-3 h-3" />,
  },
  'Terminated': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: <XCircle className="w-3 h-3" />,
  },
  'Retired': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: <UserCheck className="w-3 h-3" />,
  },
  'Suspended': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'OSD': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    icon: <HelpCircle className="w-3 h-3" />,
  },
  'Deputation': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    icon: <UserCheck className="w-3 h-3" />,
  },
  'Absent': {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'Remove': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: <XCircle className="w-3 h-3" />,
  },
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === '0000-00-00') return 'Present';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Present';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch {
    return 'Present';
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusDate,
  date,
  isActive = false,
  isTerminal = false,
  canRejoin = false,
  isOnLeave = false,
  onRejoin,
  className = ''
}) => {
  const effectiveDate = statusDate || date;
  const formattedDate = formatDate(effectiveDate || undefined);
  const displayStatus = isOnLeave ? 'On Leave' : 
    (status === 'In-Service' ? 'Active' : status);
  
  const config = statusConfig[displayStatus] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: <HelpCircle className="w-3 h-3" />,
  };

  const statusColors = useMemo(() => {
    if (isTerminal) return 'bg-red-50 text-red-700 border-red-100';
    if (isActive) {
      return isOnLeave 
        ? 'bg-yellow-50 text-yellow-700 border-yellow-100' 
        : 'bg-green-50 text-green-700 border-green-100';
    }
    return 'bg-gray-50 text-gray-700 border-gray-100';
  }, [isActive, isTerminal, isOnLeave]);

  const StatusIcon = useMemo(() => {
    if (isTerminal) return XCircle;
    if (isActive) return isOnLeave ? Clock : CheckCircle;
    return AlertCircle;
  }, [isActive, isTerminal, isOnLeave]);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors}`}>
          <StatusIcon size={12} className="flex-shrink-0" />
          <span className="truncate max-w-[120px]">
            {displayStatus}
          </span>
        </span>
        
        {canRejoin && onRejoin && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRejoin();
            }}
            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
          >
            Rejoin
          </button>
        )}
      </div>
      
      {effectiveDate && effectiveDate !== '0000-00-00' && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <ClockIcon size={10} />
          {formattedDate}
        </div>
      )}
    </div>
  );
};

export default React.memo(StatusBadge);