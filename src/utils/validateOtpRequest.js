import Joi from "joi";

const validateOtpRequest = (otp) => {
    const schema = Joi.object({
      userId: Joi.string().required(),
      otpCode: Joi.string().length(5).required(),
    });
    return schema.validate(otp);
  };

export default validateOtpRequest