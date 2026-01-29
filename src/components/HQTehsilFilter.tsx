import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, X, Search } from 'lucide-react';
import { Headquarter, Tehsil } from '../types';
import api from '../services/api';

interface HQTehsilFilterProps {
  onHQsChange: (hqIds: string[]) => void;
  onTehsilsChange: (tehsilIds: string[]) => void;
  className?: string;
}

const HQTehsilFilter: React.FC<HQTehsilFilterProps> = ({
  onHQsChange,
  onTehsilsChange,
  className = ""
}) => {
  const [hqs, setHqs] = useState<Headquarter[]>([]);
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [selectedHQs, setSelectedHQs] = useState<string[]>([]);
  const [selectedTehsils, setSelectedTehsils] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHQOpen, setIsHQOpen] = useState(false);
  const [isTehsilOpen, setIsTehsilOpen] = useState(false);
  const [hqSearch, setHqSearch] = useState('');
  const [tehsilSearch, setTehsilSearch] = useState('');
  const hqDropdownRef = useRef<HTMLDivElement>(null);
  const tehsilDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHQs = async () => {
      try {
        const response = await fetch('http://localhost/judiciary_hrms/api/get_headquarters.php');
        const data = await response.json();
        if (data.success) setHqs(data.data);
      } catch (err) {
        console.error('Failed to load HQs:', err);
      }
    };
    fetchHQs();

    const handleClickOutside = (event: MouseEvent) => {
      if (hqDropdownRef.current && !hqDropdownRef.current.contains(event.target as Node)) {
        setIsHQOpen(false);
      }
      if (tehsilDropdownRef.current && !tehsilDropdownRef.current.contains(event.target as Node)) {
        setIsTehsilOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Enable Tehsil filtering for any select HQs
    if (selectedHQs.length > 0) {
      setLoading(true);
      const hqParam = selectedHQs.join(',');
      api.getCascadeTehsils(hqParam)
        .then(data => {
          setTehsils(data);
          // Only clear tehsils that are no longer in the fetched list
          const validTehsils = selectedTehsils.filter(tid => data.some((t: any) => String(t.id) === tid));
          setSelectedTehsils(validTehsils);
          onTehsilsChange(validTehsils);
        })
        .finally(() => setLoading(false));
    } else {
      setTehsils([]);
      setSelectedTehsils([]);
      onTehsilsChange([]);
    }
  }, [selectedHQs]);

  const toggleHQ = (id: string) => {
    const newSelection = selectedHQs.includes(id)
      ? selectedHQs.filter(hid => hid !== id)
      : [...selectedHQs, id];
    setSelectedHQs(newSelection);
    onHQsChange(newSelection);
  };

  const toggleTehsil = (id: string) => {
    const newSelection = selectedTehsils.includes(id)
      ? selectedTehsils.filter(tid => tid !== id)
      : [...selectedTehsils, id];
    setSelectedTehsils(newSelection);
    onTehsilsChange(newSelection);
  };

  const selectAllHQs = () => {
    const allIds = hqs.map(h => h.id);
    setSelectedHQs(allIds);
    onHQsChange(allIds);
  };

  const deselectAllHQs = () => {
    setSelectedHQs([]);
    onHQsChange([]);
    setHqSearch('');
  };

  const selectAllTehsils = () => {
    const allIds = tehsils.map(t => String(t.id));
    setSelectedTehsils(allIds);
    onTehsilsChange(allIds);
  };

  const deselectAllTehsils = () => {
    setSelectedTehsils([]);
    onTehsilsChange([]);
    setTehsilSearch('');
  };

  const filteredHQs = hqs.filter(hq =>
    hq.title.toLowerCase().includes(hqSearch.toLowerCase())
  );

  const filteredTehsils = tehsils.filter(tehsil =>
    tehsil.title.toLowerCase().includes(tehsilSearch.toLowerCase())
  );

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Multi-HQ Selector */}
      <div className="relative" ref={hqDropdownRef}>
        <div
          onClick={() => setIsHQOpen(!isHQOpen)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:border-judiciary-300 transition-all cursor-pointer min-w-[200px]"
        >
          <MapPin size={16} className="text-judiciary-600" />
          <span className="text-sm font-bold text-gray-700 truncate max-w-[150px]">
            {selectedHQs.length === 0 ? 'All Districts' :
              selectedHQs.length === hqs.length ? 'All Districts Selected' :
                `${selectedHQs.length} Districts`}
          </span>
          <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${isHQOpen ? 'rotate-180' : ''}`} />
        </div>

        {isHQOpen && (
          <div className="absolute top-full left-0 mt-2 w-[300px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-3 mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Districts..."
                  value={hqSearch}
                  onChange={(e) => setHqSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-judiciary-600/20"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <button onClick={selectAllHQs} className="text-[10px] font-black uppercase tracking-widest text-judiciary-600 hover:text-judiciary-700">Select All</button>
                <button onClick={deselectAllHQs} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600">Clear</button>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredHQs.map(hq => (
                <div key={hq.id} onClick={() => toggleHQ(hq.id)} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${selectedHQs.includes(hq.id) ? 'bg-judiciary-50 text-judiciary-700' : 'hover:bg-gray-50 text-gray-600'}`}>
                  <span className="text-sm font-semibold">{hq.title}</span>
                  {selectedHQs.includes(hq.id) && <Check size={16} className="text-judiciary-600" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Multi-Tehsil Selector */}
      <div className="relative" ref={tehsilDropdownRef}>
        <div
          onClick={() => selectedHQs.length > 0 && setIsTehsilOpen(!isTehsilOpen)}
          className={`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:border-judiciary-300 transition-all cursor-pointer min-w-[200px] ${selectedHQs.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
        >
          <MapPin size={16} className="text-amber-600" />
          <span className="text-sm font-bold text-gray-700 truncate max-w-[150px]">
            {selectedHQs.length === 0 ? 'Select District First' :
              selectedTehsils.length === 0 ? 'All Tehsils' :
                selectedTehsils.length === tehsils.length ? 'All Tehsils Selected' :
                  `${selectedTehsils.length} Tehsils`}
          </span>
          <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${isTehsilOpen ? 'rotate-180' : ''}`} />
        </div>

        {isTehsilOpen && selectedHQs.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-[300px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-3 mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Tehsils..."
                  value={tehsilSearch}
                  onChange={(e) => setTehsilSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-judiciary-600/20"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <button onClick={selectAllTehsils} className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700">Select All</button>
                <button onClick={deselectAllTehsils} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600">Clear</button>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {loading ? (
                <p className="text-center py-4 text-gray-400 text-xs italic">Loading Tehsils...</p>
              ) : filteredTehsils.map(tehsil => (
                <div key={tehsil.id} onClick={() => toggleTehsil(String(tehsil.id))} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${selectedTehsils.includes(String(tehsil.id)) ? 'bg-amber-50 text-amber-700' : 'hover:bg-gray-50 text-gray-600'}`}>
                  <span className="text-sm font-semibold">{tehsil.title}</span>
                  {selectedTehsils.includes(String(tehsil.id)) && <Check size={16} className="text-amber-600" />}
                </div>
              ))}
              {!loading && filteredTehsils.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-xs italic">No tehsils found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HQTehsilFilter;
