const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    field: {
        type: String,
        enum: ['thesis', 'job', 'freelance', 'skill'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    resourceLink: { type: String, default: '' },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, default: '' },
    targetMinutes: { type: Number, required: true },
    actualMinutes: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'done', 'buffer'],
        default: 'pending'
    },
    comment: { type: String, default: '' },
    completedAt: { type: Date, default: null },
    lastEditedAt: { type: Date, default: null },
    }, 
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);