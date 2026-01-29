import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface Option {
    id: string;
    title: string;
}

interface MultiSelectDropdownProps {
    label: string;
    options: Option[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    label,
    options,
    selectedIds,
    onChange,
    placeholder = "Select options",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (id: string) => {
        const newSelectedIds = selectedIds.includes(id)
            ? selectedIds.filter(selectedId => selectedId !== id)
            : [...selectedIds, id];
        onChange(newSelectedIds);
    };

    const filteredOptions = options.filter(option =>
        option.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedTitles = options
        .filter(option => selectedIds.includes(option.id))
        .map(option => option.title);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">{label}</label>
            <div
                className={`w-full min-h-[42px] px-3 py-2 border-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${disabled
                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                        : isOpen
                            ? 'bg-white border-judiciary-500 ring-2 ring-judiciary-100'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 max-w-[90%]">
                    {selectedIds.length === 0 ? (
                        <span className="text-gray-400 text-sm">{placeholder}</span>
                    ) : (
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-800">
                                {selectedIds.length === 1 ? selectedTitles[0] : `${selectedIds.length} items selected`}
                            </span>
                        </div>
                    )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-judiciary-500"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No options found</div>
                        ) : (
                            <>
                                <div
                                    className="flex items-center px-3 py-2 text-sm text-judiciary-600 hover:bg-judiciary-50 rounded-md cursor-pointer font-semibold border-b border-gray-50 mb-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedIds.length === options.length) {
                                            onChange([]);
                                        } else {
                                            onChange(options.map(o => o.id));
                                        }
                                    }}
                                >
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 transition-colors ${selectedIds.length === options.length ? 'bg-judiciary-600 border-judiciary-600' : 'border-gray-300 bg-white'
                                        }`}>
                                        {selectedIds.length === options.length && <Check size={12} className="text-white" />}
                                    </div>
                                    {selectedIds.length === options.length ? 'Deselect All' : 'Select All'}
                                </div>
                                {filteredOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(option.id);
                                        }}
                                    >
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 transition-colors ${selectedIds.includes(option.id) ? 'bg-judiciary-600 border-judiciary-600' : 'border-gray-300 bg-white'
                                            }`}>
                                            {selectedIds.includes(option.id) && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className={selectedIds.includes(option.id) ? 'font-medium text-gray-900' : ''}>
                                            {option.title}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="p-2 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-lg">
                            <span className="text-xs text-gray-500">{selectedIds.length} selected</span>
                            <button
                                className="text-xs text-red-600 hover:text-red-700 font-semibold"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange([]);
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
