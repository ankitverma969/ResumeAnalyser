import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    next();
  };
};

export const schemas = {
  register: Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  analyze: Joi.object({
    resumeId: Joi.string().required(),
    jobDescription: Joi.string().required().min(50),
  }),

  rewrite: Joi.object({
    resumeId: Joi.string().required(),
    targetRole: Joi.string().required(),
  }),

  compare: Joi.object({
    resume1Id: Joi.string().required(),
    resume2Id: Joi.string().required(),
  }),
};
