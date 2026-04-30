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
import PremiumModal from '@/components/PremiumModal';

export default function TasksPage() {
  return (
    <ModuleGuard moduleId="tasks">
      <TasksContent />
    </ModuleGuard>
  );
}

function TasksContent() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
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
    assignedTo: '',
  });

  const [newNote, setNewNote] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewNote(val);
    
    // Check for @mention
    const match = val.match(/@([a-zA-Z\s]*)$/);
    if (match) {
      setShowMentions(true);
      setMentionQuery(match[1].toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const val = newNote.replace(/@([a-zA-Z\s]*)$/, `@${name} `);
    setNewNote(val);
    setShowMentions(false);
  };

  const getStaffName = (id: string) => {
    const staff = staffList.find(s => s.id === id);
    return staff ? `${staff.firstName} ${staff.lastName}` : (id === 'ADMIN' ? 'System Admin' : id);
  };

  const getStaffAvatar = (id: string) => {
    return staffList.find(s => s.id === id)?.avatar;
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const timestamp = new Date().toLocaleString();
      const author = localStorage.getItem('name') || 'System Admin';
      
      const noteHtml = `
        <div class="mt-4 p-5 bg-card/80 border border-border rounded-2xl shadow-sm">
           <div class="flex items-center gap-3 mb-2">
             <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black">${author.substring(0,2).toUpperCase()}</div>
             <span class="text-sm font-bold text-foreground">${author}</span>
             <span class="text-xs text-muted-foreground ml-auto">${timestamp}</span>
           </div>
           <div class="text-sm text-foreground/90 pl-11">${newNote.replace(/@([a-zA-Z\s]+)/g, '<span class="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary font-bold">@$1</span>')}</div>
        </div>
      `;
      
      const updatedDescription = (selectedTask.description || '') + noteHtml;
      
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: updatedDescription }),
      });
      
      if (res.ok) {
        // Trigger notification if mention exists
        const mentions = newNote.match(/@([a-zA-Z\s]+)/g);
        if (mentions) {
           for (const mention of mentions) {
             const staffName = mention.substring(1).trim();
             const staff = staffList.find(s => `${s.firstName} ${s.lastName}`.toLowerCase() === staffName.toLowerCase());
             if (staff) {
                await fetch('/api/communications/notify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({
                    userId: staff.id, 
                    title: 'Task Mention',
                    message: `${author} mentioned you in task: ${selectedTask.title}`,
                    type: 'ALERT'
                  })
                });
             }
           }
        }
        
        fetchTasks();
        setSelectedTask({...selectedTask, description: updatedDescription});
        setNewNote('');
        toast.success('Note added!');
      }
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== status) {
        updateTaskStatus(taskId, status);
        // Optimistically update UI
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        setLoading(false);
        return;
      }
      const [tasksRes, staffRes] = await Promise.all([
        fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/users/staff', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data);
      }
      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaffList(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load board data');
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

  const updateTaskDueDate = async (taskId: string, newDate: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dueDate: newDate }),
      });
      if (res.ok) {
        fetchTasks();
        setSelectedTask((prev: any) => ({...prev, dueDate: newDate}));
        toast.success('Deadline updated!');
      }
    } catch (error) {
      toast.error('Failed to update deadline');
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
            <div 
              key={column.id} 
              className="space-y-6 transition-all duration-300"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full bg-${column.color}-500 shadow-[0_0_10px_rgba(var(--${column.color}-rgb),0.5)]`}></div>
                  <h3 className="text-micro text-foreground/80 font-bold tracking-widest uppercase">{column.title}</h3>
                  <span className="bg-muted px-2 py-0.5 rounded-lg text-micro font-bold">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <MoreVertical className="w-4 h-4 text-muted-foreground/30 cursor-pointer hover:text-foreground transition-colors" />
              </div>

              <div className="space-y-4 min-h-[500px] bg-muted/20 rounded-[40px] p-4 border border-border transition-colors hover:bg-muted/30">
                {tasks.filter(t => t.status === column.id).map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    staffList={staffList}
                    onStatusChange={updateTaskStatus} 
                    onDelete={deleteTask}
                    onEdit={() => { setEditTask(task); setShowEditModal(true); }}
                    onClick={() => setSelectedTask(task)}
                    onDragStart={(e: React.DragEvent) => handleDragStart(e, task.id)}
                  />
                ))}
                <button 
                  onClick={() => {
                    setNewTask({...newTask, status: column.id as any});
                    setShowAddModal(true);
                  }}
                  className="w-full py-4 border-2 border-dashed border-border rounded-3xl text-micro text-muted-foreground hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center space-x-2 bg-transparent"
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
      <PremiumModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Project Task"
        subtitle="Define scope, priority, and ownership"
        maxWidth="max-w-3xl"
        footer={(
          <div className="flex space-x-4">
            <button onClick={() => setShowAddModal(false)} type="button" className="flex-1 py-5 bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent transition-all active:scale-95">Cancel</button>
            <button type="submit" form="add-task-form" className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95">Initialize Task</button>
          </div>
        )}
      >
        <form id="add-task-form" onSubmit={handleAdd} className="space-y-8">
           <div className="space-y-3">
              <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Task Title</label>
              <div className="relative">
                 <ClipboardList className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                 <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-3xl pl-16 pr-8 py-5 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="What needs to be done?" />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Description / Context</label>
              <div className="rounded-3xl border border-border overflow-hidden bg-background/50">
                <RichTextEditor 
                  content={newTask.description} 
                  onChange={html => setNewTask({...newTask, description: html})} 
                  placeholder="Add some context or specific sub-tasks..."
                />
              </div>
           </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Priority Level</label>
                 <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer">
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Fix</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Due Date</label>
                 <input value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} type="date" className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Assign To Staff</label>
              <select value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer">
                <option value="">Admin (Unassigned)</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.firstName} {staff.lastName}</option>
                ))}
              </select>
           </div>
        </form>
      </PremiumModal>

      {/* Task Detail View (Selected Task) */}
      <PremiumModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || 'Task Details'}
        subtitle={selectedTask ? `Task ID: #${selectedTask.id.slice(-6)}` : ''}
        maxWidth="max-w-4xl"
        footer={(
          <button 
            onClick={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}
            className="w-full py-4 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all"
          >
            Delete Task Permanently
          </button>
        )}
      >
        {selectedTask && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${priorityColors[selectedTask.priority]}`}>
                    {selectedTask.priority}
                  </span>
                  <div className="flex items-center gap-2 text-micro text-muted-foreground font-bold">
                     <span className="opacity-60 uppercase tracking-widest">Created by:</span>
                     <span className="text-foreground">{getStaffName(selectedTask.createdBy)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Description & Context
                  </h4>
                  <div 
                    className="bg-muted/30 border border-border rounded-3xl p-6 text-sm text-foreground rte-content-display min-h-[150px]"
                    dangerouslySetInnerHTML={{ __html: selectedTask.description || '<p className="text-muted-foreground italic">No description provided.</p>' }}
                  />
                  
                  {/* Note Input with Mentions */}
                  <div className="mt-8 relative">
                     <textarea 
                       value={newNote}
                       onChange={handleNoteChange}
                       placeholder="Add a note... Type @ to mention someone"
                       className="w-full bg-muted border border-border rounded-3xl px-6 py-5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
                     />
                     {showMentions && (
                       <div className="absolute bottom-full left-4 mb-2 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[500]">
                         {staffList.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(mentionQuery)).map(staff => (
                           <div 
                             key={staff.id} 
                             onClick={() => insertMention(`${staff.firstName} ${staff.lastName}`)}
                             className="px-4 py-3 hover:bg-muted cursor-pointer text-sm font-bold transition-colors flex items-center gap-2"
                           >
                             <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                               {staff.avatar ? <img src={staff.avatar} className="w-full h-full rounded-full object-cover" /> : staff.firstName[0]}
                             </div>
                             {staff.firstName} {staff.lastName}
                           </div>
                         ))}
                       </div>
                     )}
                     <div className="flex justify-end mt-2">
                       <button 
                         onClick={handleAddNote}
                         disabled={!newNote.trim()}
                         className="px-6 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                       >
                         Post Note
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Properties</h4>
                <div className="space-y-4">
                  <div className="p-5 bg-muted/50 rounded-2xl border border-border space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
                    <p className="text-sm font-black text-foreground">{selectedTask.status.replace('_', ' ')}</p>
                  </div>
                  <div className="p-5 bg-muted/50 rounded-2xl border border-border space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <input 
                        type="date" 
                        className="bg-transparent text-sm font-black text-foreground focus:outline-none hover:bg-background/50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        value={selectedTask.dueDate?.split('T')[0] || ''}
                        onChange={(e) => updateTaskDueDate(selectedTask.id, e.target.value)}
                      />
                    </div>
                  </div>
                  {selectedTask.assignedTo && (
                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Assignee</p>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                            {getStaffAvatar(selectedTask.assignedTo) ? <img src={getStaffAvatar(selectedTask.assignedTo)} className="w-full h-full rounded-full object-cover" /> : getStaffName(selectedTask.assignedTo)[0]}
                         </div>
                         <p className="text-sm font-bold text-foreground">{getStaffName(selectedTask.assignedTo)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </PremiumModal>

      {/* Task Edit Modal */}
      <PremiumModal
        isOpen={showEditModal && !!editTask}
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
        subtitle="Update scope and ownership"
        maxWidth="max-w-3xl"
        footer={(
          <button type="submit" form="edit-task-form" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all">SAVE CHANGES</button>
        )}
      >
        {editTask && (
          <form id="edit-task-form" onSubmit={handleEditSubmit} className="space-y-8">
             <div className="space-y-3">
                <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Task Title</label>
                <input required value={editTask.title} onChange={e => setEditTask({...editTask, title: e.target.value})} type="text" className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
             </div>

             <div className="space-y-3">
                <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Description</label>
                <div className="rounded-3xl border border-border overflow-hidden bg-background/50">
                  <RichTextEditor 
                    content={editTask.description || ''} 
                    onChange={html => setEditTask({...editTask, description: html})} 
                  />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Priority</label>
                   <select value={editTask.priority} onChange={e => setEditTask({...editTask, priority: e.target.value})} className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer appearance-none">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                   </select>
                </div>
                <div className="space-y-3">
                   <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Due Date</label>
                   <input value={editTask.dueDate?.split('T')[0] || ''} onChange={e => setEditTask({...editTask, dueDate: e.target.value})} type="date" className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-micro text-muted-foreground ml-2 uppercase tracking-widest font-black">Assign To Staff</label>
                <select value={editTask.assignedTo || ''} onChange={e => setEditTask({...editTask, assignedTo: e.target.value})} className="w-full bg-muted border border-border rounded-3xl px-8 py-5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer">
                  <option value="">Admin (Unassigned)</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.firstName} {staff.lastName}</option>
                  ))}
                </select>
             </div>
          </form>
        )}
      </PremiumModal>
    </DashboardLayout>
  );
}

const priorityColors: any = {
  URGENT: 'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400',
  HIGH: 'text-orange-600 bg-orange-500/10 border-orange-500/20 dark:text-orange-400',
  MEDIUM: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
  LOW: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400',
};

function TaskCard({ task, staffList, onStatusChange, onDelete, onEdit, onClick, onDragStart }: any) {
  const assignedStaff = staffList.find(s => s.id === task.assignedTo);
  const staffName = assignedStaff ? `${assignedStaff.firstName} ${assignedStaff.lastName}` : 'Unassigned';
  const staffAvatar = assignedStaff?.avatar;

  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="glass-premium p-6 rounded-[32px] border border-border group hover:border-primary/50 transition-all premium-shadow cursor-grab active:cursor-grabbing relative overflow-visible bg-card"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-micro border font-bold ${priorityColors[task.priority]}`}>
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

      <h4 className="text-body font-black text-foreground leading-relaxed mb-3 group-hover:text-primary transition-colors pr-4">
        {task.title}
      </h4>

      {task.description && (
        <div 
          className="text-caption text-muted-foreground line-clamp-2 mb-4 font-medium italic overflow-hidden bg-muted/20 p-2 rounded-xl border border-border/50"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      )}

      <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
        <div className="flex items-center space-x-2 text-micro text-muted-foreground font-bold">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
        </div>
        <div className="flex items-center -space-x-2" title={`Assigned to: ${staffName}`}>
           <div className={`w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black overflow-hidden ${assignedStaff ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
             {staffAvatar ? (
                <img src={staffAvatar} alt={staffName} className="w-full h-full object-cover" />
             ) : (
                assignedStaff ? assignedStaff.firstName[0] : 'UA'
             )}
           </div>
        </div>
      </div>

      {/* Quick Move Buttons (Progress indicator) */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted">
        <div className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.2)] ${task.status === 'COMPLETED' ? 'bg-emerald-500 w-full' : task.status === 'IN_PROGRESS' ? 'bg-amber-500 w-1/2' : 'bg-indigo-500 w-1/4'}`}></div>
      </div>
    </div>
  );
}
