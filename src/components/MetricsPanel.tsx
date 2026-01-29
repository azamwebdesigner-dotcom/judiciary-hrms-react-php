import React from 'react';
import { Users, UserCheck, UserX, TrendingUp, Award, Clock } from 'lucide-react';

interface MetricCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick?: () => void;
  trend?: { value: number; isPositive: boolean };
}

interface MetricsPanelProps {
  stats: {
    totalEmployees?: number;
    inService?: number;
    retired?: number;
    separated?: number;
    retiringSoon?: number;
    judicialOfficers?: number;
    courtStaff?: number;
    avgAge?: number;
  };
  loading: boolean;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ stats, loading }) => {
  const metrics: MetricCard[] = [
    {
      title: 'Total Strength',
      value: stats.totalEmployees || 0,
      icon: <Users size={24} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'In-Service',
      value: stats.inService || 0,
      icon: <UserCheck size={24} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Judicial Officers',
      value: stats.judicialOfficers || 0,
      icon: <Award size={24} />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Court Staff',
      value: stats.courtStaff || 0,
      icon: <TrendingUp size={24} />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Retiring Soon (3 months)',
      value: stats.retiringSoon || 0,
      icon: <Clock size={24} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Retired/Inactive',
      value: stats.retired || 0,
      icon: <UserX size={24} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {loading ? (
        Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
      ) : (
        metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer group"
            onClick={metric.onClick}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor} ${metric.color} group-hover:scale-110 transition`}>
                {metric.icon}
              </div>
              {metric.trend && (
                <div className={`text-xs font-semibold ${metric.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend.isPositive ? '↑' : '↓'} {Math.abs(metric.trend.value)}%
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{metric.title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{metric.value}</h3>
          </div>
        ))
      )}
    </div>
  );
};

export default MetricsPanel;
