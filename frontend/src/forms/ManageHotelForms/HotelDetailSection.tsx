import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";

const HotelDetailSection=()=>{
    const {register, formState:{errors}}=useFormContext<HotelFormData>();
    return(
        <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold mb-3">Add Hotel</h1>
            <label htmlFor="" className="text-gray-700 text-sm font-bold">
                Name
                <input type="text" className="border rounded w-full py-1 px-2 font-normal" {...register("name",{required:"name is required"})} />
                {errors.name && (
                        <span className="text-red-500">{errors.name.message}</span>
                    )}
            </label>
            <div className="flex gap-4">
            <label htmlFor="" className="text-gray-700 text-sm font-bold">
                city
                <input type="text" className="border rounded w-full py-1 px-2 font-normal" {...register("city",{required:"city is required"})} />
                {errors.city && (
                        <span className="text-red-500">{errors.city.message}</span>
                    )}
            </label>
            <label htmlFor="" className="text-gray-700 text-sm font-bold">
                Country
                <input type="text" className="border rounded w-full py-1 px-2 font-normal" {...register("country",{required:"country is required"})} />
                {errors.country && (
                        <span className="text-red-500">{errors.country.message}</span>
                    )}
            </label>
            </div>
            <label htmlFor="" className="text-gray-700 text-sm font-bold ">
                Description
                <textarea rows={10} className="border rounded w-full py-1 px-2 font-normal" {...register("description",{required:"description is required"})} />
                {errors.description && (
                        <span className="text-red-500">{errors.description.message}</span>
                    )}
            </label>
            <label htmlFor="" className="text-gray-700 text-sm font-bold max-w-[50%]">
                Price per night
                <input type="number" min={1} className="border rounded w-full py-1 px-2 font-normal" {...register("pricePerNight",{required:"price is required"})} />
                {errors.pricePerNight && (
                        <span className="text-red-500">{errors.pricePerNight.message}</span>
                    )}
            </label>
            <label htmlFor="" className="text-gray-700 text-sm font-bold max-w-[50%]">
                Star Rating
                <select
                {...register("starRating", {
                    required:"this field is required"
                })}  className="border rounded w-full p-2 text-gray-700 font-normal">
                    <option value="" className="text-sm font-bold">
                        select rating
                    </option>
                    {[1,2,3,4,5].map((num)=>(<option value={num}>
                        {num}
                    </option>))}
                </select>
                {errors.starRating && (
                        <span className="text-red-500">{errors.starRating.message}</span>
                    )}
            </label>
        </div>
    )
}
export default HotelDetailSection;