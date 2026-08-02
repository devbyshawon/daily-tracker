import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/shared/DashboardLayout';
import TaskCard from '../components/TaskCard';
import Modal from '../components/shared/Modal';
import { Plus, AlertTriangle, ListTodo } from 'lucide-react';


const FIELDS = [
    { key: 'thesis', label: 'Thesis' },
    { key: 'job', label: 'Job Search' },
    { key: 'freelance', label: 'Freelancing' },
    { key: 'skill', label: 'Skill Dev' },
];

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newTask, setNewTask] = useState({
      field: 'thesis', title: '', description: '', resourceLink: '', scheduledDate: new Date().toISOString().slice(0, 10), 
      scheduledTime: '', targetMinutes: 60, 
    });

    const [editingTask, setEditingTask] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editFormError, setEditFormError] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            setPageError(error.response?.data?.error || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTasks();
    }, []);

    const handleChange = (e) => {
      setNewTask(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!newTask.title.trim() || !newTask.targetMinutes) {
            setFormError('Task title and target minutes are required');
            return;
        }
        setCreating(true);
        try {
            await api.post('/tasks', newTask);
            setNewTask({ ...newTask, title: '', description: '', resourceLink: '' });
            setShowModal(false);
            fetchTasks();
        } catch (error) {
            setFormError(error.response?.data?.error || 'Something went wrong');
        } finally {
            setCreating(false);
        }
    };

    const handleEditStart = (task) => {
        setEditingTask(task);
        setEditForm({
            field: task.field,
            title: task.title,
            description: task.description || '',
            resourceLink: task.resourceLink || '',
            scheduledTime: task.scheduledTime || '',
            targetMinutes: task.targetMinutes,
        });
    };

    const handleEditChange = (e) => {
      setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditFormError('');
        if (!editForm.title?.trim() || !editForm.targetMinutes) {
            setEditFormError('Task title and target minutes are required');
            return;
        }
        setUpdating(true);
        try {
            await api.patch(`/tasks/${editingTask._id}/edit`, editForm);
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            setEditFormError(error.response?.data?.error || 'Something went wrong');
        } finally {
            setUpdating(false);
        }
    };

    const bufferTasks = tasks.filter(t => t.status === 'buffer');
    const blocked = bufferTasks.length > 0;

    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-teal-900'>Daily Tracker</h1>
                    </div>

                    <button
                        onClick={() => !blocked && setShowModal(true)}
                        disabled={blocked}
                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2'
                    >
                        <Plus className='w-4 h-4' /> New Task
                    </button>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {/* Buffer banner */}
                {blocked && (
                    <div className='mb-6'>
                        <p className='flex items-center bg-blue-50 border border-blue-200 text-teal-900 text-sm px-4 py-4 rounded-lg mb-6 hover:bg-blue-100 transition-colors'>
                            <AlertTriangle className='w-4 h-4' />
                            Buffer not clear — resolve {bufferTasks.length} task{bufferTasks.length > 1 ? 's' : ''} before adding anything new
                        </p>

                        <div className='space-y-3'>
                            {bufferTasks.map(t => (
                                <TaskCard key={t._id} task={t} refresh={fetchTasks} setPageError={setPageError} onEdit={handleEditStart} />
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading tasks...</p>
                ) : (
                    <div className='space-y-8'>
                        {FIELDS.map(({ key, label }) => {
                            const fieldTasks = tasks.filter(t => t.field === key && t.status !== 'buffer');
                            const doneCount = fieldTasks.filter(t => t.status === 'done').length;
                            return (
                                <div key={key}>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h2 className='text-sm font-semibold text-teal-900'>{label}</h2>
                                        <span className='text-xs text-gray-400'>{doneCount}/{fieldTasks.length} done</span>
                                    </div>

                                    {fieldTasks.length === 0 ? (
                                        <div className='text-center py-8 border border-dashed border-gray-200 rounded-lg'>
                                            <ListTodo className='w-8 h-8 text-gray-300 mx-auto mb-2' />
                                            <p className='text-sm text-gray-400'>No tasks yet</p>
                                        </div>
                                    ) : (
                                        <div className='space-y-3'>
                                            {fieldTasks.map(t => (
                                                <TaskCard key={t._id} task={t} refresh={fetchTasks} setPageError={setPageError} onEdit={handleEditStart} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* CREATE MODAL */}
                <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormError(''); }} title='New Task'>
                    <form onSubmit={handleCreate}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Field</label>
                            <select 
                                name='field'
                                value={newTask.field} 
                                onChange={handleChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            >
                                {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                            </select>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Task Title</label>
                            <input 
                                type='text'
                                name='title' 
                                value={newTask.title} 
                                onChange={handleChange}
                                placeholder='e.g. Read KG paper section 3'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Resource Link (optional)</label>
                            <input 
                                type='text' 
                                name='resourceLink'
                                value={newTask.resourceLink} 
                                onChange={handleChange}
                                placeholder='https://...'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Date</label>
                                <input 
                                    type='date' 
                                    name='scheduledDate'
                                    value={newTask.scheduledDate} 
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                          
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Time (optional)</label>
                                <input 
                                    type='time'
                                    name='scheduledTime' 
                                    value={newTask.scheduledTime} 
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Target Minutes</label>
                            <input 
                                type='number' 
                                name='targetMinutes' 
                                min='1' step='1' 
                                value={newTask.targetMinutes} 
                                onChange={handleChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Description (optional)</label>
                            <textarea 
                                name='description' 
                                value={newTask.description} 
                                onChange={handleChange} 
                                rows={3}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        {formError && 
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                        }

                        <button 
                            type='submit' 
                            disabled={creating}
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                        >
                            {creating ? 'Creating...' : 'Create Task'}
                        </button>
                    </form>
                </Modal>

                {/* EDIT MODAL */}
                <Modal isOpen={!!editingTask} onClose={() => { setEditingTask(null); setEditFormError(''); }} title='Edit Task'>
                    <form onSubmit={handleEditSubmit}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Field</label>
                            <select 
                                name='field' 
                                value={editForm.field || ''} 
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            >
                                {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                            </select>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Task Title</label>
                            <input 
                                type='text' 
                                name='title' 
                                value={editForm.title || ''} 
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Resource Link</label>
                            <input 
                                type='text' 
                                name='resourceLink'
                                value={editForm.resourceLink || ''} 
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Date</label>
                                <input 
                                    type='text' 
                                    value={editingTask?.scheduledDate || ''} 
                                    disabled
                                    className='w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed' 
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Time</label>
                                <input 
                                    type='time' 
                                    name='scheduledTime' 
                                    value={editForm.scheduledTime || ''} 
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                                />
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Target Minutes</label>
                            <input 
                                type='number'
                                name='targetMinutes' 
                                min='1' step='1' 
                                value={editForm.targetMinutes || ''} 
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                            <p className='text-xs text-gray-400 mt-1'>Only the target times can be changed.</p>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Description</label>
                            <textarea 
                                name='description' 
                                value={editForm.description || ''} 
                                onChange={handleEditChange} 
                                rows={3}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        {editFormError && 
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{editFormError}</p>
                        }

                        <button 
                            type='submit'
                            disabled={updating}
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;