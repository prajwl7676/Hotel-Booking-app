import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client"
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

const SignOutButton=()=>{
    const queryClient= useQueryClient();
    const {showToast}= useAppContext();
    const navigate=useNavigate();
    const mutation=useMutation(apiClient.signOut, {
        onSuccess: async ()=>{
            showToast({message:"logout successful!", type:"SUCCESS"});
            await queryClient.invalidateQueries("verifyToken");
            navigate("/");
        },
        onError:(error:Error)=>{
            showToast({message:error.message, type:"ERROR"});
        }
    })

    const handleClick=()=>{
        mutation.mutate();
    }
    return(
        <button className="text-blue-600 px-3 font-bold hover:bg-gray-400 bg-white" onClick={handleClick}>Sign Out</button>
    )
}

export default SignOutButton;