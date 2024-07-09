import Joi from "joi";

export const validateMessage = (message) => {
    const schema = Joi.object({
      content: Joi.string().min(1).required(),
      receiverId: Joi.string().required(),
    });
    return schema.validate(message);
  };