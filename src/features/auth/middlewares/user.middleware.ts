import { Request, Response, NextFunction } from "express";

export const isNotAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};