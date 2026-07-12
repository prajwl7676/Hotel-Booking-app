import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { llm } from "../llm";

const prompt = ChatPromptTemplate.fromTemplate(`
You are a luxury travel copywriter. Write a compelling 2-3 sentence
description for this hotel that highlights its best features.

Hotel name: {name}
Location: {city}, {country}
Star rating: {starRating}
Type: {type}
Facilities: {facilities}
Price per night: £{pricePerNight}

Return only the description text, no headers or extra formatting.
`);

export const descriptionChain = prompt.pipe(llm).pipe(new StringOutputParser());
