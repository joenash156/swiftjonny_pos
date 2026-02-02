import { Request, Response, NextFunction } from "express";

// Factory function to set upload type dynamically
export const requireUploadType = (type: "avatar" | "product") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.uploadType = type;
    next();
  };
};
