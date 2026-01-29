import React, { useState } from 'react';
import { MapPin, X, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface PostingPlaceEmployee {
  id: string;
  name: string;
  lastName: string;
  photoPath?: string;
  designation: string;
  bps: string;
  postingPlace: string;
  status: string;
  doa: string;
  retirementDate: string;
  daysToRetirement: number;
}

interface PostingPlace {
  postingPlaceTitle: string;
  count: number;
  employees: PostingPlaceEmployee[];
}

interface PostingPlaceGraphProps {
  data: PostingPlace[];
  onPlaceSelected: (place: string, employees: PostingPlaceEmployee[]) => void;
  loading: boolean;
}

interface HistoryFilterState {
  isOpen: boolean;
  dateFrom: string;
  dateTo: string;
}

export const PostingPlaceGraph: React.FC<PostingPlaceGraphProps> = ({
  data,
  onPlaceSelected,
  loading
}) => {
  const [selectedPlace, setSelectedPlace] = useState<PostingPlace | null>(null);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilterState>({
    isOpen: false,
    dateFrom: '',
    dateTo: ''
  });

  const chartData = data.map(place => ({
    name: place.postingPlaceTitle.length > 20 
      ? place.postingPlaceTitle.substring(0, 17) + '...' 
      : place.postingPlaceTitle,
    count: place.count,
    fullName: place.postingPlaceTitle
  }));

  const handlePlaceClick = (place: PostingPlace) => {
    setSelectedPlace(place);
    onPlaceSelected(place.postingPlaceTitle, place.employees);
  };

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={20} className="text-judiciary-600" />
              Active Posting Places
            </h3>
            <p className="text-sm text-gray-500 mt-1">Employee distribution across locations</p>
          </div>
          <button
            onClick={() => setHistoryFilter(prev => ({ ...prev, isOpen: !prev.isOpen }))}
            className="px-4 py-2 text-sm font-medium text-judiciary-600 hover:bg-judiciary-50 rounded-lg border border-judiciary-200 flex items-center gap-2"
          >
            <Calendar size={16} />
            Historical View
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading posting place data...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No posting places found</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value} employees`, 'Count']}
                labelFormatter={(label) => `Posting Place`}
              />
              <Bar 
                dataKey="count" 
                fill="#6366f1" 
                radius={[8, 8, 0, 0]}
                onClick={(state: any) => {
                  const place = data.find(p => p.postingPlaceTitle === state.payload.fullName);
                  if (place) handlePlaceClick(place);
                }}
                className="cursor-pointer hover:fill-judiciary-700"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Historical Filter */}
      {historyFilter.isOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Historical Data</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={historyFilter.dateFrom}
                onChange={e => setHistoryFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-judiciary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={historyFilter.dateTo}
                onChange={e => setHistoryFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-judiciary-600"
              />
            </div>
            <div className="flex items-end gap-2">
              <button className="flex-1 px-4 py-2 bg-judiciary-600 text-white rounded-lg hover:bg-judiciary-700 text-sm font-medium">
                Filter History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Place Details */}
      {selectedPlace && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-judiciary-50 to-blue-50 border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{selectedPlace.postingPlaceTitle}</h3>
              <p className="text-sm text-gray-600">
                {selectedPlace.employees.length} employee{selectedPlace.employees.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
            <button
              onClick={() => setSelectedPlace(null)}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPlace.employees.map(emp => {
                const daysToRetirement = emp.daysToRetirement;
                const isRetiringCritical = daysToRetirement >= 0 && daysToRetirement <= 90;
                
                return (
                  <div
                    key={emp.id}
                    className={`border-2 rounded-lg p-4 transition ${
                      isRetiringCritical 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 hover:border-judiciary-300'
                    }`}
                  >
                    <div className="flex gap-3 mb-3">
                      {emp.photoPath && (
                        <img
                          src={emp.photoPath}
                          alt={emp.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">{emp.name} {emp.lastName}</h4>
                        <p className="text-xs text-gray-500">{emp.designation}</p>
                      </div>
                      {isRetiringCritical && (
                        <div className="text-red-600 text-xs font-bold">🚨 ALERT</div>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">BPS:</span> {emp.bps}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {emp.status}
                      </div>
                      <div>
                        <span className="font-medium">Retirement:</span>{' '}
                        <span className={isRetiringCritical ? 'text-red-600 font-bold' : ''}>
                          {new Date(emp.retirementDate).toLocaleDateString()}
                        </span>
                      </div>
                      {isRetiringCritical && (
                        <div className="text-red-600 font-semibold pt-1">
                          ⏱️ {Math.ceil(daysToRetirement / 30)} months left
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostingPlaceGraph;
