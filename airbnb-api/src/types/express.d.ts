import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: Role;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

export {};
