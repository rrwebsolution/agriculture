import React from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X } from 'lucide-react';

// I-adjust ang path dependi kung asa ang GingoogGlobalMap naka-save
import { GingoogGlobalMap } from '../map/GingoogGlobalMap';

interface ViewMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mapBarangay: any;
  allBarangays: any[];
}

const ViewMapDialog: React.FC<ViewMapDialogProps> = ({ isOpen, onClose, mapBarangay, allBarangays }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-6 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300 flex flex-col h-[85vh]">
         
         {/* Header */}
         <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h3 className="text-lg font-black uppercase text-gray-800 dark:text-white flex items-center gap-2">
                <MapPin className="text-primary"/> 
                {mapBarangay ? mapBarangay.name : 'Gingoog City'} Map View
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Showing geographical location</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X size={20} />
            </button>
         </div>
         
         {/* Map Component Container */}
         <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
            <GingoogGlobalMap 
              barangays={mapBarangay ? [mapBarangay] : allBarangays} 
              onBarangayClick={() => {}} 
              // 🌟 Gipasa gihapon nato ang lat/lng padulong sa Map Component
              centerLat={mapBarangay?.latitude ? Number(mapBarangay.latitude) : null}
              centerLng={mapBarangay?.longitude ? Number(mapBarangay.longitude) : null}
            />
         </div>
         
      </div>
    </div>,
    document.body
  );
};

export default ViewMapDialog;