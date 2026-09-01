import type { Request, Response } from "express";
export declare const createAssignment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAssignments: (req: Request, res: Response) => Promise<void>;
export declare const deleteAssignment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=assignment.controller.d.ts.map