import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { X, Eye, FileText, Briefcase, Files } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ViewOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

type ViewOption = 'personal' | 'service' | 'complete' | 'all';

const ViewOptionsDialog: React.FC<ViewOptionsDialogProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName
}) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<ViewOption | null>(null);
  const [includePicture, setIncludePicture] = useState(true);

  const options = [
    {
      id: 'personal' as ViewOption,
      title: 'Personal Info Only',
      description: 'View personal details and identity information',
      icon: Eye,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'service' as ViewOption,
      title: 'Service History Only',
      description: 'View employment and service history',
      icon: Briefcase,
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'complete' as ViewOption,
      title: 'Complete Information',
      description: 'View personal info and service history',
      icon: FileText,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'all' as ViewOption,
      title: 'All Information',
      description: 'View everything including documents',
      icon: Files,
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  const handleViewClick = (option: ViewOption) => {
    const params = new URLSearchParams({
      mode: option,
      includePicture: includePicture.toString()
    });
    navigate(`/view-employee/${employeeId}?${params.toString()}`);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    View Information - {employeeName}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Select what information you want to view:
                </p>

                {/* View Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {options.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`p-4 rounded-lg border-2 transition text-left ${
                          selectedOption === option.id
                            ? 'border-judiciary-600 bg-judiciary-50'
                            : `border-gray-200 ${option.color} hover:border-judiciary-400`
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className={`flex-shrink-0 mt-1 ${
                            selectedOption === option.id
                              ? 'text-judiciary-600'
                              : 'text-gray-600'
                          }`} size={20} />
                          <div>
                            <h3 className="font-semibold text-gray-900">{option.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Profile Picture Option */}
                {selectedOption && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePicture}
                        onChange={(e) => setIncludePicture(e.target.checked)}
                        className="w-4 h-4 text-judiciary-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Include Profile Picture in view
                      </span>
                    </label>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => selectedOption && handleViewClick(selectedOption)}
                    disabled={!selectedOption}
                    className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition ${
                      selectedOption
                        ? 'bg-judiciary-600 hover:bg-judiciary-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    View Information
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ViewOptionsDialog;
