import type { NextFunction, Request, RequestHandler, Response } from "express";

// const tryCatch = (handler : RequestHandler): RequestHandler => {
//   return (req, res, next) => {
// 	Promise.resolve(handler(req, res, next)).catch((error) => {
// 	  console.error("Error occurred:", error);
// 	  res.status(500).json({ error: "Internal Server Error" });
// 	});
//   };
// };


const tryCatch = (handler: RequestHandler) : RequestHandler => {
    return async(req: Request, res: Response, next: NextFunction) =>{
        try {
            await handler(req, res, next); 
        }
        catch (error: any){
            res.status(500).json({message: error.message});
        }
    };
}

export default tryCatch