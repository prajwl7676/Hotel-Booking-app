import { useForm } from "react-hook-form"
import { useMutation, useQueryClient} from "react-query";
import * as apiClient from "../api-client"
import { useAppContext } from "../contexts/AppContext";
import { useNavigate, Link} from "react-router-dom";


export type SignInFormData={
    email:string;
    password:string;
}
const SignIn=()=>{
    const {register,formState:{errors}, handleSubmit}= useForm<SignInFormData>();
    const {showToast}=useAppContext();
    const navigate=useNavigate();
    const queryClient=useQueryClient();

    const mutation=useMutation(apiClient.signIn, {
        onSuccess:async ()=>{
           showToast({message:"Sign In Successfull", type:"SUCCESS"});
           await queryClient.invalidateQueries("verifyToken");
            navigate("/");
        },
        onError:async (error:Error)=>{
           showToast({message:error.message, type:"ERROR"});
        }
    }
    );
    
    const onSubmit=handleSubmit((formData)=>{
        mutation.mutate(formData);
    })

    return(
        <form action="" className="flex flex-col gap-5" onSubmit={onSubmit}>
            <h2 className="text-3xl font-bold">Sign In</h2>
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
            <span className="text-sm">
                Not Registered? <Link to="/register" className="underline">Create an account</Link>
            </span>
            <span>
                <button className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl">Sign In</button>
            </span>
        </form>
    )
}

export default SignIn;