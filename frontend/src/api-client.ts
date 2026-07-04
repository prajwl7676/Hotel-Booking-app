import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  HotelType,
  HotelSearchResponse,
} from "../../backend/src/shared/types";

const API_BASE_URL=import.meta.env.VITE_API_BASE_URL || "";

export const register= async (formData:RegisterFormData)=>{
    const response=await fetch(`${API_BASE_URL}/api/users/register`,{
        method:"POST",
        credentials:"include",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
    });

    const responseBody=await response.json();

    if(!response.ok){
        throw new Error(responseBody.message);
    }
}

export const validateToken= async ()=>{
    const response=await fetch(`${API_BASE_URL}/api/auth/validate-token`,{
        credentials:"include",
        cache:"no-store",
    });

    if(!response.ok){
        throw new Error("Token Invalid")
    }
    return response.json();
}

export const signIn= async (formData:SignInFormData)=>{
    const response=await fetch(`${API_BASE_URL}/api/auth/login`, {
        method:"POST",
        credentials:"include",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(formData)
    })

    const body=await response.json();
    if(!response.ok){
        throw new Error(body.message);
    }
    return body;
}

export const signOut= async ()=>{
    const response =await fetch(`${API_BASE_URL}/api/auth/logout`,{
        credentials:"include",
        method:"POST",
    })

    if(!response.ok){
        throw new Error("Error during sign out");
    }
}

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();

  if (searchParams.destination)
    queryParams.append("destination", searchParams.destination);
  if (searchParams.checkIn)
    queryParams.append("checkIn", searchParams.checkIn);
  if (searchParams.checkOut)
    queryParams.append("checkOut", searchParams.checkOut);
  if (searchParams.adultCount)
    queryParams.append("adultCount", searchParams.adultCount);
  if (searchParams.childCount)
    queryParams.append("childCount", searchParams.childCount);
  if (searchParams.page)
    queryParams.append("page", searchParams.page);
  if (searchParams.maxPrice)
    queryParams.append("maxPrice", searchParams.maxPrice);
  if (searchParams.sortOption)
    queryParams.append("sortOption", searchParams.sortOption);

  searchParams.facilities?.forEach((f) => queryParams.append("facilities", f));
  searchParams.types?.forEach((t) => queryParams.append("types", t));
  searchParams.stars?.forEach((s) => queryParams.append("stars", s));

  const response = await fetch(
    `${API_BASE_URL}/api/hotels/search?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch hotels");
  }

  return response.json();
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`);

  if (!response.ok) {
    throw new Error("Error fetching hotel");
  }

  return response.json();
};

export const addMyHotel= async (hotelFormData:FormData)=>{
    const response=await fetch(`${API_BASE_URL}/api/my-hotels`,{
        method:"POST",
        credentials:"include",
        body:hotelFormData,
    })

    if(!response.ok){
        throw new Error("failed to add hotel")
    }

    return response.json(); 
}

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};


export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching Hotels");
  }

  return response.json();
};


export const updateMyHotelById = async (hotelFormData: FormData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/my-hotels/${hotelFormData.get("hotelId")}`,
    {
      method: "PUT",
      body: hotelFormData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update Hotel");
  }

  return response.json();
};
