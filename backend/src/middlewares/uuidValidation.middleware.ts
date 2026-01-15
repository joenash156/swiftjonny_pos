import { Request, Response, NextFunction } from "express";
import { isUUID } from "../utils/checkID"; 

export const validateUUID = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({
      success: false,
      error: "Valid user id is required",
    });
    return;
  }

  if (!isUUID(id)) {
    res.status(400).json({
      success: false,
      error: "Invalid user id",
    });
    return;
  }

  next();
};
