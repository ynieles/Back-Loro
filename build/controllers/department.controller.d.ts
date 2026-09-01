import type { Response, Request } from "express";
export declare const createDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDepartments: (req: Request, res: Response) => Promise<void>;
export declare const getOneDeparment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const restoreDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=department.controller.d.ts.map