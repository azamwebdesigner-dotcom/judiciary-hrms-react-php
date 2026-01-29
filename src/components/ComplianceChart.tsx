import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ShieldAlert, CheckCircle, FileWarning } from 'lucide-react';

interface ComplianceItem {
    label: string;
    count: number;
}

interface ComplianceChartProps {
    data: ComplianceItem[];
    totalEmployees: number;
    onBarClick?: (label: string) => void;
}

const COLORS = ['#ef4444', '#f59e0b', '#6366f1'];

const ComplianceChart: React.FC<ComplianceChartProps> = ({ data, totalEmployees, onBarClick }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldAlert className="text-red-500" />
                    Administrative Compliance
                </h3>
                <p className="text-sm text-gray-500 mt-1">Personnel with incomplete profiles or missing filings</p>
            </div>

            <div className="flex-grow min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ left: 80, right: 40, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="label"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[0, 4, 4, 0]}
                            barSize={32}
                            onClick={(data) => onBarClick?.(data.label)}
                            cursor="pointer"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList dataKey="count" position="right" style={{ fill: '#475569', fontSize: 13, fontWeight: 700 }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-4">
                {data.map((item, index) => {
                    const percentage = totalEmployees > 0 ? (item.count / totalEmployees) * 100 : 0;
                    return (
                        <div key={item.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                    <FileWarning size={14} className={index === 0 ? 'text-red-500' : 'text-amber-500'} />
                                    <span className="text-xs font-bold text-gray-700">{item.label}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-400">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}

                {data.every(d => d.count === 0) && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-green-600 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle size={32} className="mb-2" />
                        <p className="text-sm font-bold">100% Compliance!</p>
                        <p className="text-[10px] opacity-75">All personnel have submitted required filings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplianceChart;
