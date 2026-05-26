import React, { useState } from 'react';
import { ShieldCheck, Edit3, Trash2, Eye, Key, ClipboardCheck, HardHat, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../../../lib/utils'; // Adjust path if needed
import PaginationFooter from '../../../../../components/ui/pagination-footer';
import type { Role } from '../RoleManagement';

interface RoleTableProps {
  isLoading: boolean;
  items: Role[];
  allFilteredItems: Role[]; 
  onView: (role: Role) => void;
  onEdit?: (role: Role) => void;
  onDelete?: (id: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const getRoleIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('page') || n.includes('admin')) return <Key size={18} />;
  if (n.includes('supervisor') || n.includes('manager')) return <ClipboardCheck size={18} />;
  if (n.includes('officer') || n.includes('field')) return <HardHat size={18} />;
  if (n.includes('encoder')) return <Database size={18} />;
  return <ShieldCheck size={18} />;
};

const RoleTable: React.FC<RoleTableProps> = ({ 
  isLoading, items, allFilteredItems, onView, onEdit, onDelete, 
  currentPage, setCurrentPage, totalPages 
}) => {
  const [expandedRoles, setExpandedRoles] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedRoles(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
      
      {/* TOP PROGRESS BAR LOADER */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}
      
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-200">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Role Definition</th>
              <th className="px-8 py-5">Permission Set</th>
              <th className="px-8 py-5 text-center">Assigned Users</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            
            {/* SKELETON LOADER */}
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-6 align-top">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gray-200 dark:bg-slate-700 shrink-0 mt-1" />
                      <div className="space-y-2 w-full mt-1">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top pt-8">
                    <div className="flex gap-2">
                      <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded-md" />
                      <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded-md" />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center align-top pt-8">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto" />
                  </td>
                  <td className="px-8 py-6 text-right align-top pt-6">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                      <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                    </div>
                  </td>
                </tr>
              ))
            ) : items.length > 0 ? (
              
              /* ACTUAL DATA ROWS */
              items.map((role) => {
                const isExpanded = expandedRoles.includes(role.id);
                return (
                  <tr key={role.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                    
                    {/* Role Definition */}
                    <td className="px-8 py-5 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm">
                          {getRoleIcon(role.name)}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">
                            {role.name}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 max-w-50 leading-tight">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Permission Set */}
                    <td className="px-8 py-5 align-top pt-8">
                      <div className="flex flex-wrap gap-1.5 max-w-md transition-all duration-300">
                        {(isExpanded ? (role.permissions || []) : (role.permissions || []).slice(0, 3)).map((p: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 text-[9px] font-bold uppercase tracking-wide rounded-md shadow-sm">
                            {p}
                          </span>
                        ))}
                        {(role.permissions || []).length > 3 && (
                          <button 
                            onClick={() => toggleExpand(role.id)} 
                            className={cn(
                              "px-2.5 py-1 text-[9px] font-black uppercase rounded-md border transition-all flex items-center gap-1 cursor-pointer",
                              isExpanded 
                                ? "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600" 
                                : "bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white"
                            )}
                          >
                            {isExpanded ? 'Show Less' : `+${role.permissions.length - 3} More`}
                            {isExpanded ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Assigned Users */}
                    <td className="px-8 py-5 text-center align-top pt-8">
                      <span className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                        {role.users_count || 0} Users
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => onView(role)} className="p-2.5 text-gray-400 bg-transparent hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all cursor-pointer" title="View Role">
                          <Eye size={16} />
                        </button>
                        {onEdit && <button onClick={() => onEdit(role)} className="p-2.5 text-gray-400 bg-transparent hover:bg-primary/10 hover:text-primary rounded-xl transition-all cursor-pointer" title="Edit Role">
                          <Edit3 size={16} />
                        </button>}
                        {onDelete && <button onClick={() => onDelete(role.id)} className="p-2.5 text-gray-400 bg-transparent hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all cursor-pointer" title="Delete Role">
                          <Trash2 size={16} />
                        </button>}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* EMPTY STATE */
              <tr>
                <td colSpan={4} className="py-24 text-center text-gray-400 uppercase text-xs font-bold italic tracking-widest">
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        shownCount={items.length}
        totalCount={allFilteredItems.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        label="Roles"
      />
    </div>
  );
}

export default RoleTable;
