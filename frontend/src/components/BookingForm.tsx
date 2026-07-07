import { useForm } from "react-hook-form";
import { BsCreditCard2Back } from "react-icons/bs";
import { UserType } from "../../../backend/src/shared/types";
import { useAppContext } from "../contexts/AppContext";

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
};

type Props = {
  currentUser: UserType;
  numberOfNights: number;
  pricePerNight: number;
};

const BookingForm = ({ currentUser, numberOfNights, pricePerNight }: Props) => {
  const { showToast } = useAppContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
    },
  });

  const onSubmit = (_data: BookingFormData) => {
    showToast({
      message: "Booking confirmed! (Payment integration coming soon)",
      type: "SUCCESS",
    });
  };

  const totalCost = pricePerNight * numberOfNights;

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
            {...register("email", { required: "Email is required" })}
            type="email"
            readOnly
            className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none"
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Payment section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-700">
          <BsCreditCard2Back className="text-blue-600" size={20} />
          <span className="font-semibold">Payment by Card</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Card Number
          </label>
          <input
            {...register("cardNumber", {
              required: "Card number is required",
              pattern: {
                value: /^[\d\s]{16,19}$/,
                message: "Enter a valid card number",
              },
            })}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
              e.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
            }}
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.cardNumber.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Expiry (MM/YY)
            </label>
            <input
              {...register("cardExpiry", {
                required: "Expiry is required",
                pattern: {
                  value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                  message: "Use MM/YY format",
                },
              })}
              placeholder="MM/YY"
              maxLength={5}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                e.target.value =
                  val.length > 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val;
              }}
            />
            {errors.cardExpiry && (
              <p className="text-red-500 text-xs mt-1">
                {errors.cardExpiry.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              CVV
            </label>
            <input
              {...register("cardCvv", {
                required: "CVV is required",
                pattern: {
                  value: /^\d{3,4}$/,
                  message: "3 or 4 digits",
                },
              })}
              placeholder="123"
              maxLength={4}
              type="password"
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.cardCvv && (
              <p className="text-red-500 text-xs mt-1">
                {errors.cardCvv.message}
              </p>
            )}
          </div>
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors text-lg"
      >
        Confirm Booking
      </button>
    </form>
  );
};

export default BookingForm;
