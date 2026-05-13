import { Prisma } from "@prisma/client";
import { Response } from "express";

export const handleControllerError = (
  error: unknown,
  res: Response,
  operation: string
): void => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[${operation}] Prisma error ${error.code}: ${error.message}`);

    if (error.code === "P2002") {
      res.status(409).json({ message: "Duplicate value violates unique constraint" });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    if (error.code === "P2003") {
      res.status(400).json({ message: "Invalid related record reference" });
      return;
    }
  }

  console.error(`[${operation}] Unexpected error:`, error);
  
  // In development, show the actual error
  if (process.env.NODE_ENV !== 'production') {
    res.status(500).json({ 
      message: "Something went wrong",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  } else {
    res.status(500).json({ message: "Something went wrong" });
  }
};
