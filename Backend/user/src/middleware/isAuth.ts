import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { IUser } from "../models/User.js";
import tryCatch from "../config/TryCatch.js";
 
export interface AuthenticatedRequest extends Request {
    user ? : IUser | null;
}

export const isAuth = async(

    req : AuthenticatedRequest,
    res : Response,
    next :  NextFunction
): Promise<void> =>{
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message: "Please Login - No auth header",
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "Token missing" });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET not defined");
        }

        const decodedValue = jwt.verify(token, jwtSecret) as JwtPayload;

        if(!decodedValue || !decodedValue.user){

            res.status(401).json({
                message: "Invalid token",
            }); 
            return;
        }

        req.user = decodedValue.user;

        next();
    }
    catch(error){

        res.status(401).json({
            message : "Please Login - JWT error"
        })
    }
}


export const myProfile =  tryCatch( async(req : AuthenticatedRequest, res) => {

    const user = req.user
    res.json(user);

})