import { useForm } from "react-hook-form";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { StripeCardElement } from "@stripe/stripe-js";
import { UserType, HotelType } from "../../../backend/src/shared/types";
import { useAppContext } from "../contexts/AppContext";
import { useSearchContext } from "../contexts/SearchContext";
import * as apiClient from "../api-client";
import { useNavigate } from "react-router-dom";

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
};

type Props = {
  currentUser: UserType;
  numberOfNights: number;
  hotel: HotelType;
};

const BookingForm = ({ currentUser, numberOfNights, hotel }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useAppContext();
  const search = useSearchContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
    },
  });

  const totalCost = hotel.pricePerNight * numberOfNights;

  const onSubmit = async (formData: BookingFormData) => {
    if (!stripe || !elements) return;

    try {
      const { clientSecret, paymentIntentId } =
        await apiClient.createPaymentIntent(hotel._id, numberOfNights);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement) as StripeCardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
          },
        },
      });

      if (result.error) {
        showToast({
          message: result.error.message || "Payment failed",
          type: "ERROR",
        });
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        await apiClient.createBooking({
          hotelId: hotel._id,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          adultCount: search.adultCount,
          childCount: search.childCount,
          totalCost,
          paymentIntentId,
        });

        showToast({ message: "Booking confirmed!", type: "SUCCESS" });
        navigate("/my-bookings");
      }
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "Booking failed",
        type: "ERROR",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-slate-200 shadow-sm bg-white p-5 space-y-5"
    >
      <h2 className="text-xl font-bold text-slate-800">Confirm Your Details</h2>

      {/* Personal details */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              First Name
            </label>
            <input
              {...register("firstName", { required: "First name is required" })}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Last Name
            </label>
            <input
              {...register("lastName", { required: "Last name is required" })}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            readOnly
            className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none"
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Stripe card */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Payment by Card
        </p>
        <div className="border border-slate-300 rounded-md p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#1e293b",
                  "::placeholder": { color: "#94a3b8" },
                },
              },
            }}
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Order summary */}
      <div className="bg-blue-50 rounded-lg px-4 py-3 flex justify-between items-center">
        <span className="text-slate-600 text-sm font-semibold">
          Total to pay
        </span>
        <span className="text-xl font-bold text-slate-800">£{totalCost}</span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors text-lg"
      >
        {isSubmitting ? "Processing..." : "Confirm Booking"}
      </button>
    </form>
  );
};

export default BookingForm;
