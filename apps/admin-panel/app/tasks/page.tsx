'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CheckSquare, 
  Clock, 
  Plus, 
  X,
  Calendar,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/components/ActionDropdown';

const INITIAL_TASKS = [
  { id: 1, title: 'Follow up with Sarah', priority: 'HIGH', due: '2026-04-26', status: 'TODO' },
  { id: 2, title: 'Draft proposal for Acme', priority: 'MEDIUM', due: '2026-04-27', status: 'IN_PROGRESS' },
  { id: 3, title: 'Review security audit', priority: 'LOW', due: '2026-04-28', status: 'TODO' },
  { id: 4, title: 'Team Sync', priority: 'URGENT', due: '2026-04-26', status: 'COMPLETED' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'MEDIUM', due: '', status: 'TODO' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now();
    setTasks([{ ...newTask, id: Number(id) }, ...tasks]);
    setShowAddModal(false);
    setNewTask({ title: '', priority: 'MEDIUM', due: '', status: 'TODO' });
    toast.success('Task created successfully!');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' } : t));
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task removed');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Activities & Tasks</h1>
            <p className="text-muted-foreground text-sm">Organize your workflow and track daily deliverables.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {tasks.length === 0 ? (
              <div className="py-20 text-center glass-premium rounded-[40px] border border-border">
                 <p className="text-muted-foreground">All tasks completed! Great job.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="glass-premium p-6 rounded-[32px] border border-border flex items-center justify-between group hover:border-primary/20 transition-all premium-shadow">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border hover:border-primary text-transparent'
                      }`}
                    >
                      <CheckSquare className="w-5 h-5" />
                    </button>
                    <div>
                      <h4 className={`text-sm font-bold transition-all ${task.status === 'COMPLETED' ? 'text-muted-foreground/50 line-through' : 'text-foreground'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center text-[10px] text-gray-500 font-black uppercase">
                          <Clock className="w-3 h-3 mr-1.5 text-primary" /> {task.due}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest ${
                          task.priority === 'HIGH' || task.priority === 'URGENT' ? 'text-red-500 bg-red-500/10' :
                          task.priority === 'MEDIUM' ? 'text-amber-500 bg-amber-500/10' :
                          'text-indigo-500 bg-indigo-500/10'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ActionDropdown 
                    onDelete={() => handleDelete(task.id)}
                    onEdit={() => toast.info('Edit mode coming soon')}
                    onView={() => toast.info(`Viewing ${task.title}`)}
                  />
                </div>
              ))
            )}
          </div>

          <aside className="space-y-8">
             <div className="glass-premium p-10 rounded-[40px] border border-border premium-shadow bg-primary/5">
                <h3 className="font-black text-foreground mb-8 text-sm uppercase tracking-widest">Productivity</h3>
                <div className="space-y-6">
                   <StatItem label="Completed" value={`${Math.round((tasks.filter(t => t.status === 'COMPLETED').length / (tasks.length || 1)) * 100)}%`} color="emerald" />
                   <StatItem label="Active" value={tasks.filter(t => t.status !== 'COMPLETED').length} color="indigo" />
                   <StatItem label="Urgent" value={tasks.filter(t => t.priority === 'URGENT').length} color="red" />
                </div>
             </div>
          </aside>
        </div>
      </div>

      {/* New Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-lg rounded-[48px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-2xl font-black text-foreground">Create Task</h2>
                  <p className="text-xs text-muted-foreground mt-1">Add a new item to your personal to-do list.</p>
               </div>
               <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Task Description</label>
                  <div className="relative">
                     <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Prepare quarterly budget" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Priority</label>
                     <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Date</label>
                     <input required value={newTask.due} onChange={e => setNewTask({...newTask, due: e.target.value})} type="date" className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
               </div>
               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-2xl shadow-primary/30 hover:opacity-90 transition-all mt-6 active:scale-95">Add Task</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatItem({ label, value, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  };
  return (
    <div className="flex justify-between items-center p-5 bg-background/50 rounded-3xl border border-border">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <span className={`px-4 py-1 rounded-xl text-xs font-black border ${colors[color]}`}>{value}</span>
    </div>
  );
}
