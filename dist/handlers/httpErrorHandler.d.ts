import { NextFunction, Request, Response } from 'express';
export declare const httpErrorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
