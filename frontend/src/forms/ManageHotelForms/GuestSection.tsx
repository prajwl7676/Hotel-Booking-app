import { useFormContext } from "react-hook-form"
import { HotelFormData } from "./ManageHotelForm"


const GuestSection=()=>{
    const{register, formState:{errors}}=useFormContext<HotelFormData>();
    return (
        <div>
            <h2 className="font-bold mb-3 text-2xl">Guest</h2>
            <div className="flex p-6 gap-10 bg-gray-300">
                <label className="w-full">
                    Adults
                    <input className="border rounded w-full" type="number" {...register("adultCount",{
                        required:"this field is required"
                    })}/>
                </label>
                {errors.adultCount && <span className="text-red-500 text-sm font-bold">
                    {errors.adultCount.message}</span>}
                <label className="w-full">
                    Children
                    <input className="border rounded w-full" type="number" {...register("childCount",{
                        required:"this field is required"
                    })}/>
                </label>
                {errors.childCount && <span className="text-red-500 text-sm font-bold">
                    {errors.childCount.message}</span>}
            </div>
        </div>
    )
}

export default GuestSection;