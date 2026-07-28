import type { Response, Request } from "express";
export declare const createEmployee: (req: Request, res: Response) => Promise<void>;
export declare const getEmployees: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateEmployee: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOneEmployee: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=empleados.controller.d.ts.map