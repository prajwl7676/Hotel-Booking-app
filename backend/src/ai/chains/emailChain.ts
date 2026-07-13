import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { llm } from "../llm";

const prompt = ChatPromptTemplate.fromTemplate(`
Generate a warm, professional booking confirmation email in HTML.
Include all provided details and a friendly sign-off from "The Holidays.com Team".
Use inline styles so the email renders well in any email client.

Guest: {guestName}
Hotel: {hotelName}, {city}, {country}
Check-in: {checkIn}
Check-out: {checkOut}
Adults: {adultCount}  Children: {childCount}
Total paid: £{totalCost}
Booking ID: {bookingId}

Return only the HTML, no markdown fences or extra commentary.
`);

export const emailChain = prompt.pipe(llm).pipe(new StringOutputParser());
