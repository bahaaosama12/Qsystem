import express from "express";

import departmentRoutes from "./routes/department.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import governorateRoutes from "./routes/governorate.routes.js";
import cityRoutes from "./routes/city.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import path from "path";

const app = express();
app.use(express.json());

app.use(express.static(path.join(process.cwd(), "src", "public")));

app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "src", "views"));

app.use("/api/departments", departmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/governorates", governorateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/booking", (req, res) => {
  res.render("booking");
});

// Global Error Middleware
app.use(errorMiddleware);

export default app;
