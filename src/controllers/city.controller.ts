import type { Request, Response } from "express";
import { getCities } from "../services/city.service.js";

const getCitiesController = async (req: Request, res: Response) => {
  const governorateId = Number(req.query.governorateId);

  const cities = await getCities(governorateId);

  res.status(200).json({
    data: cities,
  });
};

export { getCitiesController };
