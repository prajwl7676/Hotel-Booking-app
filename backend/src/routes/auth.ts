import express, {Request, Response} from "express";
import { check, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth";

const router=express.Router();

router.post("/login",[
    check("email","email is required").isEmail(),
    check("password","Password is required").isLength({min:6})
], async (req:Request, res:Response)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        res.send(400).json({message:errors.array()});
        return;
    }
    const {email,password}=req.body;

   try {
    let user=await User.findOne({email});
    if(!user){
        res.send(400).json({message:"Invalid Credentials"});
        return;
    }

    let isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        res.send(400).json({message:"Invalid Credentials"});
        return;
    }

    const token=jwt.sign({userId:user.id}, process.env.JWT_SECRET_Key as string, {expiresIn:"1d"});

    res.cookie("auth_token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        maxAge:86400000
    })

    res.status(200).json({userId:user.id});
    return;
   } catch (error) {
    res.status(500).json({message:"something went wrong"});
    console.log(error);
    return;
   }
})

router.get("/validate-token", verifyToken, (req:Request, res:Response)=>{
    res.status(200).send({userId:req.userId});
});

router.post("/logout", (req: Request, res:Response)=>{
    res.cookie("auth_token",{
        expires:new Date(0)
    })
    res.send();
})

export default router;