import React, { useState, useEffect } from 'react';
import { User, Calendar, Award, MapPin, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

interface EmployeeDetail {
    id: string;
    fullName: string;
    fatherName: string;
    photoPath: string | null;
    designation: string;
    bps: string;
    gender: string;
    doa: string;
    unitName: string;
    categoryName: string;
    postingPlaceTitle: string;
    currentSinceDate: string;
    statusDate: string;
    serviceYears: number;
    serviceMonths: number;
    transferCount: number;
    currentStatus: string;
}

interface EmployeeRankChartProps {
    postingPlaceTitle: string;
    hqId?: string;
    tehsilId?: string;
    activeType?: 'active' | 'non-active';
}

const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '';
    try {
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateStr;
    }
};

const COLORS = ['#3b82f6', '#ec4899', '#94a3b8'];

const EmployeeRankChart: React.FC<EmployeeRankChartProps> = ({ postingPlaceTitle, hqId, tehsilId, activeType = 'active' }) => {
    const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
    const [genderStats, setGenderStats] = useState<{ label: string; count: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!postingPlaceTitle) return;
            try {
                setLoading(true);
                const result = await api.getDashboardPostingPlaceDetail(postingPlaceTitle, hqId, tehsilId, activeType);
                const employees = result?.employees || (result as any)?.data?.employees || [];
                setEmployees(employees);

                const rawGenderStats = result?.genderStats || (result as any)?.data?.genderStats || [];
                const sanitizedGenderStats = (Array.isArray(rawGenderStats) ? rawGenderStats : []).map((item: any) => ({
                    ...item,
                    count: Number(item.count)
                }));
                setGenderStats(sanitizedGenderStats);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch posting place detail:', err);
                setError('Failed to load details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postingPlaceTitle, hqId, tehsilId, activeType]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-12 h-12 border-4 border-judiciary-100 border-t-judiciary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-400 font-medium">Assembling rank hierarchy...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-red-50/50 rounded-3xl border border-dashed border-red-200">
                <p className="text-red-500 font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-8">
                <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                    <Award className="text-judiciary-600" size={28} />
                    {postingPlaceTitle}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-judiciary-100 text-judiciary-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {employees.length} Personnel/Officials
                    </span>
                    <span className="text-gray-400 font-medium text-xs flex items-center gap-1">
                        <MapPin size={12} /> Rank Detail
                    </span>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {employees.map((emp) => (
                    <div
                        key={emp.id}
                        onClick={() => navigate(`/view-employee/${emp.id}`)}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-judiciary-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all group cursor-pointer"
                    >
                        {/* Photo */}
                        <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl border-2 border-gray-50 overflow-hidden shadow-sm group-hover:scale-105 transition-transform bg-gray-50">
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
                                    <div className="w-full h-full flex items-center justify-center text-judiciary-200">
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-judiciary-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-white">
                                {emp.bps}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <h4 className="text-sm font-black text-gray-900 truncate group-hover:text-judiciary-700 transition-colors leading-tight">
                                    {emp.fullName}
                                    {emp.fatherName && <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">S/O {emp.fatherName}</span>}
                                </h4>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${emp.currentStatus === 'Active' ? 'bg-green-100 text-green-700' :
                                        emp.currentStatus === 'Retired' ? 'bg-amber-100 text-amber-700' :
                                            emp.currentStatus === 'Resigned' ? 'bg-red-100 text-red-700' :
                                                emp.currentStatus === 'Deceased' ? 'bg-gray-200 text-gray-700' :
                                                    'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {emp.currentStatus}
                                    </div>
                                    <div className="flex flex-col items-end text-right">
                                        <span className="text-[7px] font-black text-indigo-600 truncate max-w-[120px] uppercase tracking-tighter">
                                            {emp.postingPlaceTitle}
                                        </span>
                                        <span className="text-[7px] font-bold text-gray-400 opacity-80">
                                            {emp.currentStatus === 'Active'
                                                ? `Since: ${formatDate(emp.currentSinceDate)}`
                                                : `Since: ${formatDate(emp.statusDate || emp.currentSinceDate)}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-judiciary-600 font-black truncate mt-1">
                                {emp.designation}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1 mb-2">
                                <span className="flex items-center gap-1">
                                    <MapPin size={10} className="text-indigo-300" />
                                    {emp.unitName} <span className="text-gray-300">|</span> {emp.categoryName}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                <span className="flex items-center gap-1">
                                    <Calendar size={10} /> {emp.serviceYears}Y {emp.serviceMonths}M ({formatDate(emp.doa)})
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={10} /> {emp.transferCount}
                                </span>
                            </div>

                            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-judiciary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Profile</span>
                                <ExternalLink size={10} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gender Mini Chart */}
            {genderStats.length > 0 && (
                <div className="mt-8 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users size={14} /> Local Gender Mix
                    </h4>
                    <div className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderStats}
                                    innerRadius={35}
                                    outerRadius={50}
                                    paddingAngle={4}
                                    dataKey="count"
                                >
                                    {genderStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeRankChart;
