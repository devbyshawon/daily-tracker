const express = require('express');
const router = express.Router();

const { getTasks, createTask, markDone, clearFromBuffer, 
    updateTimer, updateComment, deleteTask, editTask } = require('../controllers/taskController');
   
router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/done', markDone);
router.patch('/:id/clear-buffer', clearFromBuffer);
router.patch('/:id/timer', updateTimer);
router.patch('/:id/comment', updateComment);
router.delete('/:id', deleteTask);
router.patch('/:id/edit', editTask);

module.exports = router;