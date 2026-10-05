import Joi from "joi";

export const createBookingSchema = Joi.object({
  nationalId: Joi.string()
    .pattern(/^\d{14}$/)
    .required(),

  phone: Joi.string()
    .pattern(/^01[0125]\d{8}$/)
    .required(),

  branchId: Joi.number().integer().positive().required(),

  departmentId: Joi.number().integer().positive().required(),

  serviceId: Joi.number().integer().positive().required(),

  appointmentDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),

  appointmentTime: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
});

export const activeBookingSchema = Joi.object({
  nationalId: Joi.string()
    .pattern(/^\d{14}$/)
    .required(),

  phone: Joi.string()
    .pattern(/^01[0125]\d{8}$/)
    .required(),
});


export const bookingIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required(),
});

export const updateBookingSchema = Joi.object({
  appointmentDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),

  appointmentTime: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
});