import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, ChevronRight, Building2, Landmark, ListChecks, Calendar, MapPin, Users as UsersIcon, CheckCircle2, Clock, Award } from 'lucide-react';
import api from '../services/api';

interface ChartItem {
    id?: string;
    label: string;
    count: number;
    photoUrl?: string;
    sinceDate?: string;
    toDate?: string;
    bps?: string;
    tenureCount?: number;
    status?: string;
    statusDate?: string;
    isCurrentlyWorking?: number;
}

interface CategorizedPostingChartProps {
    hqId?: string;
    tehsilId?: string;
    activeType: 'active' | 'non-active';
    onActiveTypeChange: (type: 'active' | 'non-active') => void;
    onSelectPlace: (placeTitle: string) => void;
}

const RANK_COLORS: Record<string, string> = {
    'DSJ': 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    'ASJ': 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    'Senior Civil': 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
    'Civil': 'text-green-600 bg-green-50 hover:bg-green-100'
};

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

const CategorizedPostingChart: React.FC<CategorizedPostingChartProps> = ({ hqId, tehsilId, activeType, onActiveTypeChange, onSelectPlace }) => {
    const [drillLevel, setDrillLevel] = useState<'overview' | 'category' | 'court_list' | 'employee_view'>('overview');
    const [data, setData] = useState<ChartItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Menu Selection States
    const [selectedCategory, setSelectedCategory] = useState<ChartItem | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<ChartItem | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<ChartItem | null>(null);

    // Hierarchy Data for Menu
    const [categories, setCategories] = useState<ChartItem[]>([]);
    const [units, setUnits] = useState<Record<string, ChartItem[]>>({});
    const [courts, setCourts] = useState<Record<string, ChartItem[]>>({});

    // Menu visibility states
    const [showMainMenu, setShowMainMenu] = useState(false);
    const [showActiveSubmenu, setShowActiveSubmenu] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);

    // Fetch master categories on mount or when filters change
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // console.log('[MENU] Initial categories fetching for:', { hqId, tehsilId, activeType });
                const res = await api.getDashboardPostingPlacesHierarchical(hqId, tehsilId, 'overview', undefined, undefined, activeType);
                // console.log('[MENU] Initial categories response:', res);

                if (res.success && Array.isArray(res.data)) {
                    setCategories(res.data);
                } else if (Array.isArray(res)) {
                    setCategories(res);
                }
            } catch (err) {
                console.error('[MENU] Initial fetch error:', err);
            }
        };
        fetchInitial();
    }, [hqId, tehsilId, activeType]);

    // Clear cache when active status changes
    useEffect(() => {
        setUnits({});
        setCourts({});
        setHoveredCategory(null);
        setHoveredUnit(null);
    }, [activeType]);

    const fetchLevelData = async (type: 'category' | 'court_list', id: string) => {
        const stringId = String(id);

        // Check cache
        if (type === 'category' && units[stringId]) return;
        if (type === 'court_list' && courts[stringId]) return;

        try {
            // console.log(`[MENU] Fetching ${type} list for:`, { id: stringId, activeType });
            const res = await api.getDashboardPostingPlacesHierarchical(
                hqId,
                tehsilId,
                type,
                type === 'category' ? stringId : selectedCategory?.id,
                type === 'court_list' ? stringId : undefined,
                activeType
            );

            const listData = res.success ? res.data : (Array.isArray(res) ? res : []);

            if (type === 'category') {
                setUnits(prev => ({ ...prev, [stringId]: listData }));
            }
            if (type === 'court_list') {
                setCourts(prev => ({ ...prev, [stringId]: listData }));
            }
        } catch (err) {
            console.error(`[MENU] ${type} fetch error:`, err);
        }
    };

    const fetchEmployees = async () => {
        if (!selectedCourt || !selectedUnit) return;
        try {
            setLoading(true);
            // console.log('[EMPLOYEE] Fetching for:', selectedCourt.label);
            const res = await api.getDashboardPostingPlacesHierarchical(
                hqId,
                tehsilId,
                'employee_view',
                selectedCategory?.id,
                selectedUnit.id,
                activeType,
                'hq_and_tehsil',
                undefined, undefined,
                selectedCourt.label
            );

            const rawData = res.success ? res.data : (Array.isArray(res) ? res : []);
            const processedData = Array.isArray(rawData) ? rawData.map((i: any) => ({
                ...i,
                count: Number(i.count) || Number(i.tenureCount) || 0
            })) : [];

            setData(processedData);
            setDrillLevel('employee_view');
        } catch (err) {
            console.error('[EMPLOYEE] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCourt) {
            fetchEmployees();
        }
    }, [selectedCourt, hqId, tehsilId, activeType]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 max-w-xs z-[200]">
                    {d.photoUrl && (
                        <img
                            src={api.getPhotoUrl(d.photoUrl)}
                            className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-judiciary-500 shadow-md"
                            alt={d.label}
                        />
                    )}
                    <div className="text-center mb-2">
                        <p className="font-black text-gray-800 text-sm leading-tight">{d.label}</p>
                        {d.designation && <p className="text-[10px] text-judiciary-600 font-black uppercase tracking-tight">{d.designation}</p>}
                        {d.fatherName && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">S/O {d.fatherName}</p>}
                    </div>
                    <div className="space-y-1 text-[10px] text-gray-500 font-medium pt-2 border-t border-gray-50">
                        <p className="flex justify-between"><span>Rank/BPS:</span> <span className="text-gray-800 font-bold">{d.bps}</span></p>
                        <p className="flex justify-between">
                            <span>{activeType === 'active' ? 'Posting Since:' : 'Duration:'}</span>
                            <span className="text-gray-800 font-bold">
                                {activeType === 'active'
                                    ? formatDate(d.sinceDate)
                                    : (d.sinceDate && d.sinceDate !== '0000-00-00'
                                        ? `${formatDate(d.sinceDate)} - ${formatDate(d.toDate) || 'Present'}`
                                        : `${d.status || 'Terminal'} on: ${formatDate(d.statusDate || d.sinceDate)}`
                                    )
                                }
                            </span>
                        </p>
                        <p className="flex justify-between font-black">
                            <span>Status:</span>
                            <span className={`${d.isCurrentlyWorking === 1 || d.status === 'In-Service' ? 'text-green-600' : 'text-amber-600'}`}>
                                {d.isCurrentlyWorking === 1 || d.status === 'In-Service' ? 'Active' : d.status}
                            </span>
                        </p>
                        <p className="flex justify-between"><span>Tenure (Months):</span> <span className="text-indigo-600 font-black">{d.count}</span></p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderCustomBar = (props: any) => {
        const { x, y, width, height, payload } = props;
        if (!payload) return null;

        const barColor = parseInt(payload.bps) >= 17 ? '#10b981' : parseInt(payload.bps) >= 11 ? '#3b82f6' : '#f59e0b';

        return (
            <g>
                <rect x={x} y={y} width={width} height={height} fill={barColor} rx={4} />
                {payload.photoUrl && (
                    <foreignObject x={x + (width / 2) - 16} y={y - 45} width={32} height={32}>
                        <img
                            src={api.getPhotoUrl(payload.photoUrl)}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md object-cover"
                            alt=""
                        />
                    </foreignObject>
                )}
                <text x={x + width / 2} y={y - 5} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight="bold">BPS-{payload.bps}</text>
            </g>
        );
    };

    const CustomTick = (props: any) => {
        const { x, y, payload } = props;
        const d = data.find(i => i.label === payload.value);
        if (!d) return null;

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="middle" fill="#1e293b" fontSize={9} fontWeight="900" className="uppercase tracking-tighter">
                    {d.label}
                </text>
                {/* @ts-ignore */}
                {d.designation && (
                    <text x={0} y={0} dy={26} textAnchor="middle" fill="#94a3b8" fontSize={7} fontWeight="bold" className="uppercase tracking-widest">
                        {/* @ts-ignore */}
                        {d.designation}
                    </text>
                )}
            </g>
        );
    };

    return (
        <div className="bg-white rounded-xl flex flex-col h-full w-full relative">

            {/* Nav Menu Header */}
            <div
                className="bg-judiciary-600 inline-flex self-start text-white rounded-xl p-1 mb-8 items-center gap-1 overflow-visible z-50 shadow-lg border border-judiciary-700 select-none"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="relative px-4 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all flex items-center gap-2"
                    onClick={() => setShowMainMenu(!showMainMenu)}
                    onMouseEnter={() => setShowMainMenu(true)}
                >
                    <Building2 size={16} className="text-judiciary-100" />
                    <span className="font-black text-[11px] uppercase tracking-wider">Explore Hierarchy</span>
                    <ChevronRight size={14} className={`transition-transform duration-300 ${showMainMenu ? 'rotate-90' : ''}`} />

                    {/* Level 1: Multi-Column Menu Container */}
                    {showMainMenu && (
                        <div
                            className="absolute top-full left-0 mt-3 flex items-start z-[100] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                            onMouseLeave={() => {
                                setShowMainMenu(false);
                                setShowActiveSubmenu(false);
                                setHoveredCategory(null);
                                setHoveredUnit(null);
                            }}
                        >
                            {/* Main Options Column */}
                            <div className="w-72 bg-white/95 backdrop-blur-xl text-gray-800 rounded-2xl border border-gray-100/50 overflow-hidden shadow-2xl">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Postings Baseline</span>
                                </div>

                                {/* Active Link */}
                                <div
                                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${showActiveSubmenu ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}
                                    onMouseEnter={() => {
                                        onActiveTypeChange('active');
                                        setShowActiveSubmenu(true);
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onActiveTypeChange('active');
                                        setShowActiveSubmenu(true);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showActiveSubmenu ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'}`}>
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <span className="font-bold text-sm">Active Courts & Offices</span>
                                    </div>
                                    <ChevronRight size={14} className={showActiveSubmenu ? 'text-green-400' : 'text-gray-300'} />
                                </div>

                                {/* Historical Link */}
                                <div
                                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${activeType === 'non-active' && showActiveSubmenu ? 'bg-amber-50 text-amber-700' : 'hover:bg-gray-50'}`}
                                    onMouseEnter={() => {
                                        onActiveTypeChange('non-active');
                                        setShowActiveSubmenu(true);
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onActiveTypeChange('non-active');
                                        setShowActiveSubmenu(true);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeType === 'non-active' && showActiveSubmenu ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                                            <Clock size={18} />
                                        </div>
                                        <span className="font-bold text-sm">Non-Active & Historical</span>
                                    </div>
                                    <ChevronRight size={14} className={activeType === 'non-active' && showActiveSubmenu ? 'text-amber-400' : 'text-gray-300'} />
                                </div>
                            </div>

                            {/* Level 2: Categories (Submenu Column) */}
                            {showActiveSubmenu && (
                                <div className="ml-1 w-64 bg-white/95 backdrop-blur-xl text-gray-800 rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden animate-in slide-in-from-left-2 duration-200 flex flex-col max-h-[70vh]">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 shrink-0">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Category</span>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar">
                                        {categories.length === 0 ? (
                                            <div className="p-8 text-center text-gray-300">
                                                <div className={`animate-spin w-4 h-4 border-2 ${activeType === 'active' ? 'border-indigo-500' : 'border-amber-500'} border-t-transparent rounded-full mx-auto mb-2`}></div>
                                                <p className="text-[9px] uppercase font-black">Syncing...</p>
                                            </div>
                                        ) : (
                                            categories.map(cat => (
                                                <div
                                                    key={cat.id}
                                                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${hoveredCategory === String(cat.id) ? (activeType === 'active' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700') : 'hover:bg-gray-50'}`}
                                                    onMouseEnter={() => {
                                                        setHoveredCategory(String(cat.id));
                                                        if (cat.id) fetchLevelData('category', String(cat.id));
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-sm">{cat.label}</span>
                                                    </div>
                                                    <ChevronRight size={14} className={hoveredCategory === String(cat.id) ? (activeType === 'active' ? 'text-indigo-400' : 'text-amber-400') : 'text-gray-300'} />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Level 3: Units (Submenu Column) */}
                            {hoveredCategory && units[hoveredCategory] && (
                                <div className="ml-1 w-60 bg-white/95 backdrop-blur-xl text-gray-800 rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden animate-in slide-in-from-left-2 duration-200 flex flex-col max-h-[70vh]">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 shrink-0">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Unit Type</span>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar">
                                        {units[hoveredCategory].map(unit => (
                                            <div
                                                key={unit.id}
                                                className={`p-4 flex items-center justify-between cursor-pointer transition-all ${hoveredUnit === String(unit.id) ? (activeType === 'active' ? 'bg-blue-50 text-blue-700' : 'bg-amber-100/50 text-amber-700') : 'hover:bg-gray-50'} ${RANK_COLORS[unit.label] || ''}`}
                                                onMouseEnter={() => {
                                                    setHoveredUnit(String(unit.id));
                                                    if (unit.id) fetchLevelData('court_list', String(unit.id));
                                                }}
                                            >
                                                <span className="font-black text-xs uppercase tracking-tighter">{unit.label}</span>
                                                <ChevronRight size={14} className="opacity-30" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Level 4: Final List (The "Combobox" equivalent) */}
                            {hoveredUnit && courts[hoveredUnit] && (
                                <div className="ml-1 w-80 bg-white/95 backdrop-blur-xl text-gray-800 rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden animate-in slide-in-from-left-2 duration-200 flex flex-col max-h-[70vh]">
                                    <div className={`${activeType === 'active' ? 'bg-indigo-600' : 'bg-amber-600'} px-4 py-3 sticky top-0 z-10 shrink-0`}>
                                        <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Available Centers / Courts</span>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar">
                                        {courts[hoveredUnit].length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 italic text-xs">No active records found</div>
                                        ) : (
                                            courts[hoveredUnit].map(court => (
                                                <div
                                                    key={court.id}
                                                    className={`p-3 ${activeType === 'active' ? 'hover:bg-indigo-50' : 'hover:bg-amber-50'} cursor-pointer border-b border-gray-50 group flex items-center justify-between transition-colors`}
                                                    onClick={() => {
                                                        setSelectedCourt(court);
                                                        setSelectedUnit(units[hoveredCategory!]?.find(u => String(u.id) === hoveredUnit) || null);
                                                        setSelectedCategory(categories.find(c => String(c.id) === hoveredCategory) || null);
                                                        onSelectPlace(court.label);
                                                        setShowMainMenu(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400 group-hover:bg-${activeType === 'active' ? 'indigo' : 'amber'}-600 group-hover:text-white transition-colors`}>
                                                            {court.label.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className={`text-[11px] font-bold text-gray-700 group-hover:text-${activeType === 'active' ? 'indigo' : 'amber'}-700`}>{court.label}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{court.count}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected Status Bar */}
                {selectedCourt && (
                    <div className="flex items-center px-4 h-full border-l border-white/20 ml-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-judiciary-200 tracking-tighter">Selected Authority</span>
                            <span className="text-[11px] font-bold max-w-[200px] truncate leading-tight">{selectedCourt.label}</span>
                        </div>
                        <button
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => {
                                setSelectedCourt(null);
                                setDrillLevel('overview');
                                setData([]);
                            }}
                        >
                            <ArrowLeft size={12} className="text-white/60" />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col items-center justify-center min-h-[550px] bg-gray-50/50 rounded-3xl overflow-hidden shadow-inner p-8 relative">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest animate-pulse">Aggregating Rank Metadata...</p>
                    </div>
                ) : !selectedCourt ? (
                    <div className="text-center p-12 max-w-lg">
                        <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mx-auto mb-8 border border-gray-50">
                            <UsersIcon size={64} className="text-indigo-100" />
                        </div>
                        <h4 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Postings Hierarchy</h4>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                            Utilize the <span className="text-indigo-600 font-black uppercase">Explore Hierarchy</span> engine to visualize personnel distribution across specific Judicial Categories and Units.
                        </p>
                        <div className="flex justify-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-[10px] font-bold text-gray-500">
                                <CheckCircle2 size={14} className="text-green-500" /> 11 Main Categories
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-[10px] font-bold text-gray-500">
                                <Award size={14} className="text-indigo-500" /> All Ranks & BPS
                            </div>
                        </div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center">
                        <UsersIcon size={48} className="text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold italic">No active personnel found for this selection</p>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight">{selectedCourt.label}</h2>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{selectedCategory?.label} • {selectedUnit?.label}</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase">
                                    {data.length} TOTAL OFFICER/OFFICIALS
                                </div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data} margin={{ top: 60, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                                <XAxis
                                    dataKey="label"
                                    height={80}
                                    interval={0}
                                    tick={<CustomTick />}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    label={{ value: 'Tenure (Months)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b', fontWeight: 'bold' } }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                                <Bar
                                    dataKey="count"
                                    shape={renderCustomBar as any}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-4xl mx-auto">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center transform transition hover:scale-105">
                                <p className="text-4xl font-black text-indigo-600">{data.length}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">TOTAL OFFICER/OFFICIALS</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center transform transition hover:scale-105">
                                <p className="text-4xl font-black text-green-600">{Math.round(data.reduce((sum, d) => sum + (d.count || 0), 0) / data.length) || 0}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Avg. Tenure (M)</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center transform transition hover:scale-105">
                                <p className="text-4xl font-black text-amber-500">{data.length > 0 ? Math.max(...data.map(d => parseInt(d.bps || '0') || 0)) : 0}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Max Grade Rank</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategorizedPostingChart;
