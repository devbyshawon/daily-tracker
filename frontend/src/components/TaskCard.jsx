import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Link2, CheckCircle2, Pencil, Trash2, Play, Square, ArrowRightCircle } from 'lucide-react';


const FIELD_DOT = {
    thesis: 'bg-teal-600',
    job: 'bg-blue-500',
    freelance: 'bg-purple-500',
    skill: 'bg-rose-500',
};

const TaskCard = ({ task, refresh, setPageError, onEdit }) => {
    const [comment, setComment] = useState(task.comment || '');
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState((task.actualMinutes || 0) * 60000);
    const [alerted, setAlerted] = useState(false);
    const startRef = useRef(null);
    const accumulatedRef = useRef((task.actualMinutes || 0) * 60000);
    const audioRef = useRef(null);
    const targetMs = task.targetMinutes * 60 * 1000;

    const isDone = task.status === 'done';
    const isBuffer = task.status === 'buffer';
    const timeComplete = task.actualMinutes >= task.targetMinutes;

    useEffect(() => {
        if (!running) {
            return;
        }
        const id = setInterval(() => {
            const now = accumulatedRef.current + (Date.now() - startRef.current);
            setElapsed(now);
            if (now >= targetMs && !alerted) {
                setAlerted(true);
                audioRef.current = new Audio('/chime.mp3');
                audioRef.current.play().catch(() => {});
                if (Notification.permission === 'granted') {
                    new Notification("Time's up", { body: `${task.title} — target reached` });
                }
            }
        }, 1000);
        return () => clearInterval(id);
    }, [running, alerted, targetMs, task.title]);

    const start = () => {
        startRef.current = Date.now();
        setRunning(true);
    };

    const stop = async () => {
        accumulatedRef.current += Date.now() - startRef.current;
        const mins = accumulatedRef.current / 60000;
        setElapsed(accumulatedRef.current);
        setRunning(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        try {
            await api.patch(`/tasks/${task._id}/timer`, { actualMinutes: mins });
            if (mins >= task.targetMinutes) {
                await api.patch(`/tasks/${task._id}/done`);
            }
            refresh();
        } catch (error) {
            setPageError(error.response?.data?.error || 'Failed to log time');
        }
    };

    const handleDone = async () => {
        if (!timeComplete) return;
        try {
            await api.patch(`/tasks/${task._id}/done`);
            refresh();
        } catch (error) {
            setPageError(error.response?.data?.error || 'Failed to mark done');
        }
    };

    const handleCommentSave = async () => {
      try {
          await api.patch(`/tasks/${task._id}/comment`, { comment });
          refresh();
      } catch (error) {
          setPageError(error.response?.data?.error || 'Failed to save comment');
      }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${task._id}`);
            refresh();
        } catch (error) {
            setPageError(error.response?.data?.error || 'Failed to delete task');
        }
    };

    const handleClearBuffer = async () => {
        try {
            await api.patch(`/tasks/${task._id}/clear-buffer`);
            refresh();
        } catch (error) {
            setPageError(error.response?.data?.error || 'Failed to clear buffer');
        }
    };

    const mm = String(Math.floor(elapsed / 60000)).padStart(2, '0');
    const ss = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');

    return (
        <div className={`border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow ${isDone ? 'bg-gray-50' : ''} ${isBuffer ? 'border-amber-300' : ''}`}>
            <div className='flex items-start justify-between gap-3'>
                <div className='flex items-start gap-3 flex-1'>
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${FIELD_DOT[task.field]}`} />

                    <div className='flex-1'>
                        <p className={`font-medium text-teal-900 text-sm ${isDone ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                        </p>

                        {task.description && 
                            <p className='text-xs text-gray-500 mt-0.5'>{task.description}</p>
                        }

                        <div className='flex items-center gap-2 mt-1'>
                            <span className='text-xs text-gray-400'>{task.scheduledDate}{task.scheduledTime && ` · ${task.scheduledTime}`}</span>
                            <span className='text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500'>{task.targetMinutes}m</span>
                        </div>

                        {task.resourceLink && (
                            <a 
                                href={task.resourceLink} 
                                target='_blank' 
                                rel='noreferrer'
                                className='inline-flex items-center gap-1 mt-1 text-xs text-teal-600 hover:text-teal-700'
                            >
                                <Link2 className='w-3 h-3' /> Resource
                            </a>
                        )}
                    </div>
                </div>

                <div className='flex items-center gap-3'>
                    {!isBuffer && (
                        <button
                            onClick={handleDone}
                            disabled={!timeComplete && !isDone}
                            title={!timeComplete && !isDone ? 'Complete the timer first' : 'Mark done'}
                            className={`${isDone ? 'text-teal-600' : timeComplete ? 'text-gray-300 hover:text-teal-600' : 'text-gray-200 cursor-not-allowed'}`}
                        >
                            <CheckCircle2 className='w-5 h-5' />
                        </button>
                    )}

                    {!isBuffer && (
                        <button 
                            onClick={() => onEdit(task)} 
                            className='text-gray-300 hover:text-teal-600' 
                            title='Edit task'
                        >
                            <Pencil className='w-4 h-4' />
                        </button>
                    )}

                    {!isBuffer && (
                        <button 
                            onClick={handleDelete} 
                            className='text-gray-300 hover:text-red-500' 
                            title='Delete task'
                        >
                            <Trash2 className='w-4 h-4' />
                        </button>
                    )}
                </div>
            </div>

            {!isDone && !isBuffer && (
                <div className='mt-3 pl-5 flex items-center gap-2'>
                    <span className={`font-mono text-sm ${alerted ? 'text-amber-600' : 'text-gray-600'}`}>
                        {mm}:{ss} <span className='text-gray-400'>/ {task.targetMinutes}:00</span>
                    </span>

                    {!running ? (
                        <button 
                            onClick={start} 
                            className='flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700'
                        >
                            <Play className='w-3 h-3' /> Start
                        </button>
                    ) : (
                        <button 
                            onClick={stop} 
                            className='flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700'
                        >
                            <Square className='w-3 h-3' /> Stop
                        </button>
                    )}
                </div>
            )}

            {isBuffer && (
                <button 
                    onClick={handleClearBuffer}
                    className='mt-3 ml-5 flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700'
                >
                    <ArrowRightCircle className='w-3 h-3' /> Move to today & resolve
                </button>
            )}

            <div className='mt-2 pl-5'>
                <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onBlur={handleCommentSave}
                    placeholder='Add a comment...'
                    className='w-full text-xs text-teal-900 border-0 border-b border-gray-200 focus:border-teal-500 focus:bg-white outline-none focus:outline-none focus:ring-0 px-0 py-1 bg-transparent placeholder:text-gray-500'
                />
            </div>
        </div>
    );
};

export default TaskCard