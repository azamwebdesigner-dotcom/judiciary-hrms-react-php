import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Briefcase, MapPin, Award, Calendar, ExternalLink, User, ArrowUpRight, Clock, Scale } from 'lucide-react';
import api from '../services/api';

interface DrillDownEmployee {
    id: string;
    fullName: string;
    photoPath: string;
    designation: string;
    bps: string;
    postingPlaceTitle: string;
    unitName: string;
    categoryName: string;
    doa: string;
    serviceYears: number;
    transferCount: number;
    leaveType?: string;
    leaveStartDate?: string;
    leaveEndDate?: string;
    leaveDays?: number;
    missingYears?: string[];
    gp_total_availed?: number;
    gp_current_balance?: number;
    gp_monthly_deduction?: number;
    currentStatus?: string;
    statusDate?: string;
    fromDate?: string;
    // Disciplinary details
    disciplinaryStatus?: 'Pending' | 'Decided';
    courtName?: string;
    inquiryStartDate?: string;
    inquiryDecidedDate?: string;
    inquiryDecision?: string;
}

interface DrillDownUnit {
    id: string;
    title: string;
    employeeCount: number;
}

interface DrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    employees?: DrillDownEmployee[];
    units?: DrillDownUnit[];
    loading: boolean;
    onUnitClick?: (unitTitle: string, unitId: string) => void;
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, title, employees = [], units = [], loading, onUnitClick }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    const formatLeaveDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        let days = endDate.getDate() - startDate.getDate() + 1; // +1 to include both start and end dates

        if (days < 0) {
            months -= 1;
            const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }

        const parts = [];
        if (years > 0) parts.push(`${years}Y`);
        if (months > 0) parts.push(`${months}M`);
        if (days > 0 || parts.length === 0) parts.push(`${days}D`);
        return parts.join(' ');
    };

    const handleViewProfile = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onClose();
        navigate(`/view-employee/${id}`);
    };

    const handleUnitClick = (unit: DrillDownUnit) => {
        console.log('DrillDownModal handleUnitClick called', { unit, onUnitClick });
        if (onUnitClick) {
            console.log('Calling parent onUnitClick');
            onUnitClick(unit.title, unit.id);
        } else {
            console.log('onUnitClick prop is undefined!');
        }
    };

    const isShowingUnits = units && units.length > 0;
    const totalCount = isShowingUnits ? units.length : employees.length;
    const countLabel = isShowingUnits ? 'Total Units' : 'Total Employees';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <p className="text-sm text-gray-500 mt-1">{countLabel}: {totalCount}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-judiciary-200 border-t-judiciary-600 rounded-full animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Loading details...</p>
                        </div>
                    ) : isShowingUnits ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {units.map((unit) => (
                                <div
                                    key={unit.id}
                                    onClick={() => handleUnitClick(unit)}
                                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-judiciary-200 group cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-judiciary-50 rounded-lg flex items-center justify-center text-judiciary-600">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 group-hover:text-judiciary-700 transition-colors">{unit.title}</h3>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Unit</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-judiciary-600">{unit.employeeCount}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Personnel</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700">No records found</h3>
                            <p className="text-gray-500">There are no matching records for this criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {employees.map((emp) => (
                                <div
                                    key={emp.id}
                                    onClick={(e) => handleViewProfile(e, emp.id)}
                                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-judiciary-200 group cursor-pointer relative"
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink size={16} className="text-judiciary-600" />
                                    </div>
                                    <div className="flex gap-5">
                                        {/* Photo */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-50 bg-gray-100">
                                                {emp.photoPath ? (
                                                    <img
                                                        src={api.getPhotoUrl(emp.photoPath)}
                                                        alt={emp.fullName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as any).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(emp.fullName) + '&background=random';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-judiciary-50 text-judiciary-600 text-xl font-bold">
                                                        {emp.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-judiciary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                                BPS-{emp.bps}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2 max-w-[80%]">
                                                    <h3 className="font-bold text-gray-900 truncate group-hover:text-judiciary-700 transition-colors">
                                                        {emp.fullName}
                                                    </h3>

                                                </div>
                                            </div>

                                            <div className="text-sm font-medium text-judiciary-600 mb-2 truncate">
                                                {emp.designation}
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <MapPin size={14} className="text-judiciary-600 flex-shrink-0" />
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-gray-800 leading-tight">{emp.postingPlaceTitle}</span>
                                                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                                                            <span>Unit: <span className="text-gray-700">{emp.unitName}</span></span>
                                                            <span className="text-gray-300">|</span>
                                                            <span>Category: <span className="text-gray-700">{emp.categoryName}</span></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        <span>{emp.serviceYears}Y Experience</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Award size={14} className="text-gray-400" />
                                                        <span>{emp.transferCount} Transfers</span>
                                                    </div>
                                                </div>

                                                {/* Leave Details Enhancement */}
                                                {emp.leaveType && (
                                                    <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-700 uppercase tracking-tighter">
                                                                <Clock size={12} />
                                                                {emp.leaveType}
                                                            </div>
                                                            <div className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-black rounded-lg shadow-sm">
                                                                {formatLeaveDuration(emp.leaveStartDate!, emp.leaveEndDate!)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Starts</span>
                                                                <span className="text-xs font-black text-amber-900">{new Date(emp.leaveStartDate!).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Ends</span>
                                                                <span className="text-xs font-black text-amber-900">{new Date(emp.leaveEndDate!).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* GP Fund Advance Details */}
                                                {(emp.gp_total_availed !== undefined && emp.gp_total_availed > 0) && (
                                                    <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-2">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-700 uppercase tracking-tighter mb-1">
                                                            <Briefcase size={12} />
                                                            GP Fund Advance
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="bg-orange-50 p-2 rounded border border-orange-100">
                                                                <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest block mb-0.5">Total Amount</span>
                                                                <span className="text-xs font-black text-orange-900">{emp.gp_total_availed.toLocaleString()}</span>
                                                            </div>
                                                            <div className="bg-red-50 p-2 rounded border border-red-100">
                                                                <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest block mb-0.5">Installment</span>
                                                                <span className="text-xs font-black text-red-900">{emp.gp_monthly_deduction?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="bg-green-50 p-2 rounded border border-green-100">
                                                                <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest block mb-0.5">Remaining</span>
                                                                <span className="text-xs font-black text-green-900">{emp.gp_current_balance?.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Compliance Years Badges */}
                                                {emp.missingYears && emp.missingYears.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-1">Missing:</span>
                                                        {emp.missingYears.map((year, idx) => {
                                                            let bgColor = 'bg-red-50 text-red-700 border-red-100';
                                                            if (title.toLowerCase().includes('assets')) bgColor = 'bg-amber-50 text-amber-700 border-amber-100';
                                                            if (title.toLowerCase().includes('fbr')) bgColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';

                                                            return (
                                                                <span
                                                                    key={idx}
                                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${bgColor} shadow-sm animate-in fade-in zoom-in duration-300`}
                                                                    style={{ animationDelay: `${idx * 50}ms` }}
                                                                >
                                                                    {year}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Disciplinary Details Enhancement */}
                                                {(emp.disciplinaryStatus || title.toLowerCase().includes('suspended') || title.toLowerCase().includes('absent') || title.toLowerCase().includes('disciplinary') || title.toLowerCase().includes('quality')) && (emp.inquiryStartDate || emp.courtName) && (
                                                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${emp.disciplinaryStatus === 'Decided' ? 'text-green-700' : 'text-red-700'}`}>
                                                                <Scale size={12} />
                                                                {emp.disciplinaryStatus || (emp.inquiryDecidedDate ? 'Decided' : 'Inquiry Progress')}
                                                            </div>
                                                            {emp.inquiryDecidedDate && emp.inquiryDecidedDate !== '0000-00-00' ? (
                                                                <div className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-black rounded-lg shadow-sm">
                                                                    Decided: {new Date(emp.inquiryDecidedDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </div>
                                                            ) : emp.inquiryStartDate && emp.inquiryStartDate !== '0000-00-00' ? (
                                                                <div className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-sm">
                                                                    Started: {new Date(emp.inquiryStartDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="space-y-1">
                                                            {emp.courtName && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Court Name</span>
                                                                    <span className="text-xs font-black text-red-900">{emp.courtName}</span>
                                                                </div>
                                                            )}
                                                            {emp.inquiryDecision && (
                                                                <div className="bg-white/50 p-2 rounded border border-red-100">
                                                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest block mb-1">Decision Details</span>
                                                                    <p className="text-[11px] font-medium text-gray-800 leading-snug">{emp.inquiryDecision}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-judiciary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span>View Full Profile</span>
                                                    <ArrowUpRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DrillDownModal;
