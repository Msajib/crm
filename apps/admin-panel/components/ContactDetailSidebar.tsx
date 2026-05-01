import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Activity, 
  FileText, 
  ChevronRight, 
  User, 
  Building2, 
  Tag, 
  MoreVertical as MoreIcon,
  Layers,
  Trash2,
  Edit,
  ArrowRightLeft,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SendEmailModal from './SendEmailModal';
import ConvertDealModal from './ConvertDealModal';

interface ContactDetailSidebarProps {
  contact: any;
  staffList?: any[];
  onClose: () => void;
  onRefresh?: () => void;
}

export default function ContactDetailSidebar({ contact, staffList = [], onClose, onRefresh }: ContactDetailSidebarProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const getStaffName = (id: string) => {
    const staff = staffList.find(s => s.id === id);
    return staff ? `${staff.firstName} ${staff.lastName}` : (id === 'ADMIN' ? 'System Admin' : 'Unassigned');
  };

  return (
    <>
      <div className="fixed inset-0 z-[450] flex justify-end">
        {/* Backdrop to close */}
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
        ></div>

        {/* Sidebar Modal */}
        <div className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <header className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/20">
               <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20">
                     {contact?.firstName?.[0] || '?'}{contact?.lastName?.[0] || ''}
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-foreground leading-tight">{contact?.firstName || 'Unknown'} {contact?.lastName || 'Contact'}</h2>
                     <div className="flex items-center space-x-2 mt-1">
                       <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Lead Score:</span>
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${contact?.score > 80 ? 'bg-emerald-500/10 text-emerald-500' : contact?.score > 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                          {contact?.score || 0}%
                       </span>
                     </div>
                  </div>
               </div>
               <button onClick={onClose} className="p-2.5 bg-muted/50 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
               </button>
            </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
             {/* Ownership Info */}
             <section className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Created By</p>
                   <p className="text-xs font-bold text-foreground">{getStaffName(contact?.createdBy)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-muted/30 border border-border">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Assigned To</p>
                   <p className="text-xs font-bold text-foreground">{getStaffName(contact?.assignedTo)}</p>
                </div>
             </section>

             {/* Communication Timeline */}
             <section>
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Recent Activity</h3>
                   <button className="text-[10px] font-black text-primary hover:underline">LOG ACTIVITY</button>
                </div>
                <div className="space-y-6">
                   {(contact?.activities || []).map((activity: any, idx: number) => (
                      <div key={idx} className="flex space-x-4">
                         <div className="mt-1">
                            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                               <Activity className="w-4 h-4 text-primary" />
                            </div>
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start">
                               <h4 className="text-sm font-bold text-foreground">{activity.subject}</h4>
                               <span className="text-[10px] text-muted-foreground font-medium">{new Date(activity.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{activity.notes}</p>
                         </div>
                      </div>
                   ))}
                   {(!contact?.activities || contact.activities.length === 0) && (
                      <div className="text-center py-10 border-2 border-dashed border-border rounded-3xl">
                         <p className="text-xs text-muted-foreground font-bold italic">No recorded activities yet.</p>
                      </div>
                   )}
                </div>
             </section>

             {/* Quick Info */}
             <section className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-muted/30 border border-border">
                   <Mail className="w-4 h-4 text-primary mb-3" />
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                   <p className="text-sm font-bold text-foreground truncate">{contact?.email || 'N/A'}</p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/30 border border-border">
                   <Phone className="w-4 h-4 text-primary mb-3" />
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Phone</p>
                   <p className="text-sm font-bold text-foreground">{contact?.phone || 'N/A'}</p>
                </div>
             </section>

             {/* Details */}
             <section className="space-y-4">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">Contact Details</h3>
                <div className="space-y-4 p-6 rounded-3xl bg-muted/30 border border-border">
                   <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-xs font-bold text-muted-foreground">Job Title</span>
                      <span className="text-xs font-black text-foreground">{contact?.jobTitle || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-xs font-bold text-muted-foreground">Source</span>
                      <span className="text-xs font-black text-primary">{contact?.source || 'Direct'}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-xs font-bold text-muted-foreground">Status</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">{contact?.status}</span>
                   </div>
                   <div className="flex flex-col py-2">
                      <span className="text-xs font-bold text-muted-foreground mb-2">Address</span>
                      <span className="text-xs font-medium text-foreground">{contact?.address || 'No address provided'}</span>
                   </div>
                </div>
             </section>

             {/* Linked Deals */}
             <section>
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Associated Deals</h3>
                   <button 
                     onClick={() => setShowConvertModal(true)}
                     className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                   >
                     <Plus className="w-3 h-3" /> NEW DEAL
                   </button>
                </div>
                <div className="space-y-3">
                   {(contact?.deals || []).map((deal: any, idx: number) => (
                      <div key={idx} className="group p-4 rounded-2xl border border-border hover:border-primary/50 transition-all cursor-pointer">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                               <DollarSign className="w-4 h-4 text-emerald-500" />
                               <span className="text-sm font-bold text-foreground group-hover:text-primary">{deal.title}</span>
                            </div>
                            <span className="text-xs font-black text-foreground">${deal.value.toLocaleString()}</span>
                         </div>
                      </div>
                   ))}
                   {(!contact?.deals || contact.deals.length === 0) && (
                      <p className="text-xs text-muted-foreground font-bold italic">No active deals found.</p>
                   )}
                </div>
             </section>
          </div>

          <footer className="p-8 border-t border-border flex space-x-4 bg-muted/30 relative">
             <button 
               onClick={() => setShowEmailModal(true)}
               className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center"
             >
                <Mail className="w-4 h-4 mr-2" />
                SEND EMAIL
             </button>
             
             <div className="relative">
                <button 
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center hover:bg-muted transition-all bg-card shadow-sm"
                >
                  <MoreIcon className="w-5 h-5 text-muted-foreground" />
                </button>

                {showActionMenu && (
                  <div className="absolute bottom-full right-0 mb-4 w-56 bg-card border border-border rounded-3xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200 z-[500]">
                     <button 
                       onClick={() => { setShowConvertModal(true); setShowActionMenu(false); }}
                       className="w-full flex items-center gap-3 p-4 hover:bg-primary/10 hover:text-primary rounded-2xl text-xs font-black transition-all"
                     >
                        <ArrowRightLeft className="w-4 h-4" />
                        CONVERT TO DEAL
                     </button>
                     <div className="h-px bg-border my-1" />
                     <button className="w-full flex items-center gap-3 p-4 hover:bg-muted rounded-2xl text-xs font-bold text-foreground transition-all">
                        <Edit className="w-4 h-4" />
                        EDIT RECORD
                     </button>
                     <button className="w-full flex items-center gap-3 p-4 hover:bg-rose-500/10 text-rose-500 rounded-2xl text-xs font-black transition-all">
                        <Trash2 className="w-4 h-4" />
                        DELETE CONTACT
                     </button>
                  </div>
                )}
             </div>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <SendEmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        contact={contact} 
      />
      <ConvertDealModal 
        isOpen={showConvertModal} 
        onClose={() => setShowConvertModal(false)} 
        contact={contact}
        onSuccess={onRefresh}
      />
    </>
  );
}
