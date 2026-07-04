import { useMutation } from "react-query";
import ManageHotelForm from "../forms/ManageHotelForms/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../api-client"
const AddHotels=()=>{
    const{showToast}=useAppContext();
    const {mutate, isLoading}=useMutation(apiClient.addMyHotel, {
        onSuccess:()=>{
            showToast({message:"Hotel Save!", type:"SUCCESS"})
        },
        onError:()=>{
            showToast({message:"Error while saving", type:"ERROR"})
        }
    });
    const handleSave=(hotelFormData:FormData)=>{
        mutate(hotelFormData);
    }
    return(
        <ManageHotelForm onSave={handleSave} isLoading={isLoading} />
    )
}

export default AddHotels;