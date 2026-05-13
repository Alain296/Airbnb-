import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body || {},
        query: req.query || {},
        params: req.params || {}
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log("Validation errors:", JSON.stringify(error.issues, null, 2));
        const errors = error.issues?.map((err) => ({
          path: err.path?.join(".") || "unknown",
          message: err.message || "Validation error"
        })) || [];
        res.status(400).json({
          message: "Validation failed",
          errors
        });
        return;
      }
      console.error("Validation middleware error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
};
