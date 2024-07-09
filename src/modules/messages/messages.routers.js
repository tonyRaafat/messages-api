import express from 'express';
import { addMessage, deleteMessage, getmessages, updateMessage } from './messages.controller.js';

const router = express.Router();

router.post('/',addMessage);
router.get('/', getmessages);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

export default router;
