import { Message } from "../../../database/models/message.model.js";
import { throwError } from "../../utils/throwerror.js";
import { validateMessage } from "../../utils/validateMessage.js";

export const addMessage = async (req, res, next) => {
    try {
        const { error } = validateMessage(req.body);
        if (error) throw throwError(error.details[0].message,400);

        const message = new Message({
            content: req.body.content,
            receiverId: req.body.receiverId,
            senderId: req.user._id
        });

        await message.save();
        res.send(message);

    } catch (error) {
        next(error)
    }
}

export const getmessages = async(req,res,next)=>{
    try {
        const messages = await Message.find({ receiverId: req.user._id });
        res.send(messages);
    } catch (error) {
        next(error)
    }
}

export const updateMessage = async (req,res,next)=>{
    try {
        const { content } = req.body
        const message = await Message.findById(req.params.id);
        if (!message) throw throwError('Message not found.',400);
    
        if (message.senderId.toString() !== req.user._id.toString()) {
            throw throwError('Access denied.',403);
        }
    
        await Message.updateOne({ _id: req.params.id }, { content });
        res.send('Message updated.');
    } catch (error) {
        next(error)
    }
}

export const deleteMessage = async (req,res,next)=>{
    try {
        const message = await Message.findById(req.params.id);
        if (!message) throw throwError('Message not found.',400);
    
        if (message.receiverId.toString() !== req.user._id.toString()) {
            throw throwError('Access denied.',403);
        }

        await Message.deleteOne({ _id: req.params.id });
        res.send('Message deleted.');
    } catch (error) {
        next(error)
    }
}