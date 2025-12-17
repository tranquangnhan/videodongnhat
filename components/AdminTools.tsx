import React from 'react';
import { Shield, X } from 'lucide-react';

interface AdminToolsProps {
  onClose: () => void;
}

const AdminTools: React.FC<AdminToolsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold">Admin Panel (Role = 1)</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-slate-300 text-sm">
          <p className="mb-4">
            Xin chào Admin. Bạn có toàn quyền truy cập hệ thống.
          </p>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
             <h4 className="font-semibold text-white mb-2">Thống kê Roles</h4>
             <ul className="space-y-2 text-xs font-mono">
               <li className="flex justify-between">
                 <span>Role 1:</span>
                 <span className="text-emerald-400">Admin (Full Access)</span>
               </li>
               <li className="flex justify-between">
                 <span>Role 2:</span>
                 <span className="text-blue-400">Member (Can Generate)</span>
               </li>
               <li className="flex justify-between">
                 <span>Role 0:</span>
                 <span className="text-red-400">Pending (Blocked)</span>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTools;