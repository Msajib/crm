'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';

import RichTextEditor from '@/components/RichTextEditor';
import { 
  CheckSquare, 
  Clock, 
  Plus, 
  X,
  Calendar,
  AlertTriangle,
  ClipboardList,
  MoreVertical,
  CheckCircle2,
  Circle,
  Hash,
  MessageSquare,
  Globe,
  Trash2,
  Edit
} from 'lucide-react';
import ActionDropdown from '@/components/ActionDropdown';
import ModuleGuard from '@/components/ModuleGuard';

export default function TasksPage() {
  return (
    <ModuleGuard moduleId="tasks">
      <TasksContent />
    </ModuleGuard>
  );
}

function TasksContent() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editTask, setEditTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    priority: 'MEDIUM', 
    dueDate: '', 
    status: 'TODO',
    description: '',
  });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        toast.success('Task created!');
        setShowAddModal(false);
        setNewTask({ title: '', priority: 'MEDIUM', dueDate: '', status: 'TODO', description: '' });
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${editTask.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editTask),
      });
      if (res.ok) {
        toast.success('Task updated!');
        setShowEditModal(false);
        setEditTask(null);
        fetchTasks();
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTasks();
        toast.success(`Moved to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Permanently delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Task deleted');
        fetchTasks();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'indigo' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'amber' },
    { id: 'COMPLETED', title: 'Completed', color: 'emerald' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-display text-foreground mb-2">Project Board</h1>
            <p className="text-body text-muted-foreground font-medium italic">Manage your tasks with Trello-style logic and real-time synchronization.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </header>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          {columns.map((column) => (
            <div key={column.id} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full bg-${column.color}-500 shadow-[0_0_10px_rgba(var(--${column.color}-rgb),0.5)]`}></div>
                  <h3 className="text-micro text-foreground/80">{column.title}</h3>
                  <span className="bg-muted px-2 py-0.5 rounded-lg text-micro">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <MoreVertical className="w-4 h-4 text-muted-foreground/30 cursor-pointer hover:text-foreground transition-colors" />
              </div>

              <div className="space-y-4 min-h-[500px] bg-muted/20 rounded-[40px] p-4 border border-border">
                {tasks.filter(t => t.status === column.id).map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusChange={updateTaskStatus} 
                    onDelete={deleteTask}
                    onEdit={() => { setEditTask(task); setShowEditModal(true); }}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
                <button 
                  onClick={() => {
                    setNewTask({...newTask, status: column.id as any});
                    setShowAddModal(true);
                  }}
                  className="w-full py-4 border-2 border-dashed border-border rounded-3xl text-micro text-muted-foreground hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-display tracking-tight">New Project Task</h2>
                  <p className="text-body text-muted-foreground mt-2">Define scope, priority, and ownership.</p>
               </div>
               <button onClick={() => setShowAddModal(false)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-8">
               <div className="space-y-3">
                  <label className="text-micro text-muted-foreground ml-2">Task Title</label>
                  <div className="relative">
                     <ClipboardList className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                     <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-3xl pl-16 pr-8 py-5 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="What needs to be done?" />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-micro text-muted-foreground ml-2">Description / Context (Rich Text)</label>
                  <RichTextEditor 
                    value={newTask.description} 
                    onChange={html => setNewTask({...newTask, description: html})} 
                    placeholder="Add some context or specific sub-tasks..."
                    minHeight={150}
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-micro text-muted-foreground ml-2">Priority Level</label>
                     <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                        <option value="URGENT">Urgent Fix</option>
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-micro text-muted-foreground ml-2">Due Date</label>
                     <input required value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} type="date" className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
               </div>

               <div className="flex space-x-4 pt-6">
                 <button onClick={() => setShowAddModal(false)} type="button" className="flex-1 py-5 bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent transition-all active:scale-95">Cancel</button>
                 <button type="submit" className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95">Initialize Task</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail View (Selected Task) */}
      {selectedTask && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-3xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-micro border ${priorityColors[selectedTask.priority]}`}>
                      {selectedTask.priority}
                    </span>
                    <span className="text-micro text-muted-foreground uppercase tracking-widest">Task ID: #{selectedTask.id.slice(-6)}</span>
                  </div>
                  <h2 className="text-display tracking-tight">{selectedTask.title}</h2>
               </div>
               <button onClick={() => setSelectedTask(null)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-subheading flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Description
                  </h4>
                  <div 
                    className="bg-muted/30 border border-border rounded-3xl p-8 text-body text-foreground rte-content-display min-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: selectedTask.description || '<p className="text-muted-foreground italic">No description provided.</p>' }}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-micro text-muted-foreground uppercase tracking-[0.2em]">Properties</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-2xl border border-border space-y-1">
                      <p className="text-micro text-muted-foreground">Status</p>
                      <p className="text-body font-bold text-foreground">{selectedTask.status.replace('_', ' ')}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-2xl border border-border space-y-1">
                      <p className="text-micro text-muted-foreground">Due Date</p>
                      <div className="flex items-center gap-2 text-body font-bold text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <button 
                    onClick={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}
                    className="w-full py-4 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {showEditModal && editTask && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="glass-premium w-full max-w-2xl rounded-[50px] border border-border p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-display tracking-tight">Edit Task</h2>
               <button onClick={() => setShowEditModal(false)} className="p-4 hover:bg-muted rounded-2xl transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-8">
               <div className="space-y-3">
                  <label className="text-micro text-muted-foreground ml-2">Task Title</label>
                  <input required value={editTask.title} onChange={e => setEditTask({...editTask, title: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
               </div>

               <div className="space-y-3">
                  <label className="text-micro text-muted-foreground ml-2">Description</label>
                  <RichTextEditor 
                    value={editTask.description || ''} 
                    onChange={html => setEditTask({...editTask, description: html})} 
                    minHeight={150}
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-micro text-muted-foreground ml-2">Priority</label>
                     <select value={editTask.priority} onChange={e => setEditTask({...editTask, priority: e.target.value})} className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-micro text-muted-foreground ml-2">Due Date</label>
                     <input value={editTask.dueDate?.split('T')[0] || ''} onChange={e => setEditTask({...editTask, dueDate: e.target.value})} type="date" className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
               </div>

               <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const priorityColors: any = {
  URGENT: 'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400',
  HIGH: 'text-orange-600 bg-orange-500/10 border-orange-500/20 dark:text-orange-400',
  MEDIUM: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
  LOW: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400',
};

function TaskCard({ task, onStatusChange, onDelete, onEdit, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="glass-premium p-6 rounded-[32px] border border-border group hover:border-primary/30 transition-all premium-shadow cursor-pointer relative overflow-hidden bg-card"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-micro border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
           <ActionDropdown 
              onDelete={() => onDelete(task.id)}
              onEdit={() => { onEdit(); }}
              onView={onClick}
           />
        </div>
      </div>

      <h4 className="text-body font-bold text-foreground leading-relaxed mb-4 group-hover:text-primary transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <div 
          className="text-caption text-muted-foreground line-clamp-2 mb-4 font-medium italic overflow-hidden"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      )}

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <div className="flex items-center space-x-2 text-micro text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
        </div>
        <div className="flex -space-x-2">
           <div className="w-6 h-6 rounded-full bg-primary/20 border border-border flex items-center justify-center text-micro font-black">S</div>
        </div>
      </div>

      {/* Quick Move Buttons */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
        <div className={`h-full transition-all duration-500 ${task.status === 'COMPLETED' ? 'bg-emerald-500 w-full' : task.status === 'IN_PROGRESS' ? 'bg-amber-500 w-1/2' : 'bg-indigo-500 w-1/4'}`}></div>
      </div>
    </div>
  );
}
