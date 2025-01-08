import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client.ts";
import { useAppContext } from "../contexts/AppContext.tsx";
import { useNavigate } from "react-router-dom";

export type RegisterFormData={
    firstName:string;
    lastName:string;
    email:string;
    password:string;
    confirmPassword:string;
}



const Register=()=>{

    const queryClient=useQueryClient();
    const navigate=useNavigate();
    const {showToast}=useAppContext();

    const {register, watch, handleSubmit, formState:{errors}}= useForm<RegisterFormData>();

    const mutation=useMutation(apiClient.register,{
        onSuccess:async ()=>{
            showToast({message:"Registration Successfull!",type:"SUCCESS"});
            await queryClient.invalidateQueries("verifyToken");
            navigate("/");
        },
        onError:(error:Error)=>{
            showToast({message:error.message, type:"ERROR"})
        }
    });
    const onSubmit=handleSubmit((data)=>{
        mutation.mutate(data);
        // console.log(data);
    }) 
    return(
        <form className="flex flex-col gap-5" action="" onSubmit={onSubmit}>
            <h2 className="text-3xl font-bold">Create an account</h2>
            <div className="flex flex-col gap-5 md:flex-row">
                <label htmlFor="" className="text-gray-700 text-sm font-bold flex-1">
                    First name
                    <input type="text" className="border rounded w-full py-1 px-2 font-normal" {...register("firstName",{required:"This field is required"})} />
                    {errors.firstName && (
                        <span className="text-red-500 ">{errors.firstName.message}</span>
                    )}
                </label>
                <label htmlFor="" className="text-gray-700 text-sm font-bold flex-1">
                    Last name
                    <input type="text" className="border rounded w-full py-1 px-2 font-normal" {...register("lastName",{required:"This field is required"})} />
                    {errors.lastName && (
                        <span className="text-red-500">{errors.lastName.message}</span>
                    )}
                </label>
            </div>
            <label htmlFor="" className="text-gray-700 text-sm font-bold">
                Email
                <input type="email" className="border rounded w-full py-1 px-2 font-normal" {...register("email",{required:"email is required"})} />
                {errors.email && (
                        <span className="text-red-500">{errors.email.message}</span>
                    )}
            </label>
            <label htmlFor="" className="text-gray-700 text-sm font-bold" >
                Password
                <input type="password" className="border rounded py-1 px-2 w-full font-normal" {...register("password",{required:"Please enter password", minLength:{value:6, message:"Password must be at least 6 characters"}})}/>
                {errors.password && (
                        <span className="text-red-500">{errors.password.message}</span>
                    )}
            </label>
            <label htmlFor="" className="text-gray-700 text-sm font-bold">
                Confirm Password
                <input type="password" className="border rounded w-full font-normal py-1 px-2" {...register("confirmPassword",{validate:(val)=>{
                    if(!val){
                        return "This field is required";
                    }else if(watch("password")!==val){
                        return "Passwords do not match"
                    }
                }})}/>
                {errors.confirmPassword && (
                        <span className="text-red-500">{errors.confirmPassword.message}</span>
                    )}
            </label>
            <span>
                <button className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl">Create Account</button>
            </span>
        </form>
    )
}

export default Register;