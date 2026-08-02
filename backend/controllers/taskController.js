const Task = require('../models/Task');

const sweepOver = async function sweepOverdueToBuffer() {
    const today = new Date().toISOString().slice(0, 10);
    await Task.updateMany(
        { scheduledDate: { $lt: today }, status: 'pending' },
        { $set: { status: 'buffer' } }
    );
};

const getTasks = async (req, res, next) => {
    try {
        await sweepOver();
        const tasks = await Task.find().sort({ scheduledDate: 1, scheduledTime: 1 });
        res.json(tasks);
    } catch (error) { 
        next(error); 
    }
};

const createTask = async (req, res, next) => {
    try {
        await sweepOver();
        const bufferCount = await Task.countDocuments({ status: 'buffer' });
        if (bufferCount > 0) {
            return res.status(409).json({
                error: 'Buffer not clear. Resolve buffered tasks before adding new ones.'
            });
        }
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) { 
        next(error); 
    }
};

const markDone = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status: 'done', completedAt: new Date() },
            { new: true }
        );
        res.json(task);
    } catch (error) { 
        next(error); 
    }
};

const clearFromBuffer = async (req, res, next) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status: 'pending', scheduledDate: today },
            { new: true }
        );
        res.json(task);
    } catch (error) { 
        next(error); 
    }
};

const updateTimer = async (req, res, next) => {
    try {
        const { actualMinutes } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id, 
            { actualMinutes }, 
            { new: true }
        );
        res.json(task);
    } catch (error) { 
        next(error); 
    }
};

const updateComment = async (req, res, next) => {
    try {
        const { comment } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id, 
            { comment }, 
            { new: true }
        );
        res.json(task);
    } catch (error) { 
        next(error); 
    }
};

const deleteTask = async (req, res, next) => {
    try {
        const existing = await Task.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (existing.status === 'buffer') {
            return res.status(403).json({ error: 'Buffered tasks cannot be deleted. Resolve it first.' });
        }
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) { 
        next(error); 
    }
};

const editTask = async (req, res, next) => {
    try {
        const existing = await Task.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (existing.status === 'buffer') {
            return res.status(403).json({ error: 'Buffered tasks cannot be edited. Resolve it first.' });
        }

        const { field, title, description, resourceLink, scheduledTime, targetMinutes } = req.body;
        const update = {};
        if (field !== undefined) {
            update.field = field;
        }
        if (title !== undefined) {
            update.title = title;
        }
        if (description !== undefined) {
            update.description = description;
        }
        if (resourceLink !== undefined) {
            update.resourceLink = resourceLink;
        }
        if (scheduledTime !== undefined) {
            update.scheduledTime = scheduledTime;
        }
        if (targetMinutes !== undefined) {
            update.targetMinutes = targetMinutes;
        }
        update.lastEditedAt = new Date()

        const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) { 
        next(error); 
    }
};

module.exports = { getTasks, createTask, markDone, clearFromBuffer, updateTimer, updateComment, deleteTask, editTask };