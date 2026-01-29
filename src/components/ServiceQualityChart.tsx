import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, Fingerprint, Activity } from 'lucide-react';

interface DisciplinaryItem {
    label: string;
    count: number;
}

interface ServiceQualityChartProps {
    data: DisciplinaryItem[];
    onSliceClick?: (label: string) => void;
}

const COLORS = {
    'Absent': '#ef4444',
    'Suspended': '#f97316',
    'OSD': '#8b5cf6',
    'Remove': '#1f2937',
    'Terminated': '#b91c1c',
    'Other': '#94a3b8'
};

const ServiceQualityChart: React.FC<ServiceQualityChartProps> = ({ data, onSliceClick }) => {
    const isHealthy = data.length === 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full bg-gradient-to-br from-white to-red-50/20">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="text-red-600" />
                    Service Quality & Discipline
                </h3>
                <p className="text-sm text-gray-500 mt-1">Monitoring performance flags and career irregularities</p>
            </div>

            <div className="flex-grow flex items-center justify-center min-h-[250px] relative">
                {isHealthy ? (
                    <div className="text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                            <Fingerprint className="text-green-600" size={40} />
                        </div>
                        <p className="font-bold text-gray-800">Clean Records</p>
                        <p className="text-xs text-gray-400">Selected segment has no active disciplinary flags.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={8}
                                dataKey="count"
                                nameKey="label"
                                animationBegin={200}
                                animationDuration={1000}
                                onClick={(data) => onSliceClick && onSliceClick(data.label)}
                                className="cursor-pointer focus:outline-none"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.label as keyof typeof COLORS] || COLORS['Other']}
                                        stroke="none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="diamond" />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                {data.slice(0, 4).map((item) => (
                    <div key={item.label} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[item.label as keyof typeof COLORS] || COLORS['Other'] }}></div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.label}</p>
                            <p className="text-lg font-black text-gray-800 leading-none">{item.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            {!isHealthy && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
                    <AlertTriangle className="text-red-600 mt-0.5" size={14} />
                    <p className="text-[10px] text-red-700 font-medium">
                        High-priority flags detected. Administrative review may be required for these personnel.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ServiceQualityChart;
