import Joi from "joi";

const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(3).required(),
    message: Joi.string().min(10).required(),
});

export const validateContactForm = (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message,
        });
    }

    next();
};
