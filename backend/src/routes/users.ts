import express, { Request, Response } from 'express';
import User from '../models/user';
import jwt from "jsonwebtoken";
import { check, validationResult } from 'express-validator';
import verifyToken from '../middleware/auth';

const router= express.Router();

router.post('/register', [
    check("firstName","this field is required").isString(),
    check("lastName","this field is required").isString(),
    check("email","this field is required").isEmail(),
    check("password","Password should be atleast 6 characters").isLength({min:6})
], async (req:Request, res:Response)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({message:errors.array()});
        return;
    }
     try {
        let user=await User.findOne({
            email: req.body.email,
        });

        if(user){
            res.status(400).json({message:"User Already exists"});
            return;
        };
        user= new User(req.body);
        await user.save();

        const token=jwt.sign(
            {userId:user.id},
            process.env.JWT_SECRET_KEY as string,
            {
                expiresIn:'1d'
            }
        );

        res.cookie("auth_token",token,
            {
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                maxAge:86400000,
            }
        );
        res.status(200).send({message:"registration Successfull"});
        return;
    } catch (error) {
        res.status(500).send({message:"Something went wrong"});
        console.log(error);
    }
});

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
