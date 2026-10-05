import { Router } from "express";
import { validate } from "../middleware/validation.middleware.js";
import { createBookingSchema ,activeBookingSchema,bookingIdSchema,updateBookingSchema } from "../validators/booking.validation.js";
import { createBookingController ,getActiveBookingController ,cancelBookingController,  updateBookingController,
 } from "../controllers/booking.controller.js";

const router = Router();

router.post("/", validate(createBookingSchema), createBookingController);
router.post("/active",validate(activeBookingSchema),getActiveBookingController,);
router.patch("/:id/cancel",validate(bookingIdSchema, "params"),cancelBookingController,);
router.patch("/:id",validate(bookingIdSchema, "params"), validate(updateBookingSchema, "body"),updateBookingController,);



export default router;
