import { NextFunction, Request, Response } from 'express';
declare type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const asyncWrapper: (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => void;
export {};
