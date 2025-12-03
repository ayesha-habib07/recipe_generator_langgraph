// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


// if (!process.env.OPENAI_API_KEY) {
//     throw new Error("❌ OPENAI_API_KEY is missing. Please add it to your .env.local file");
// }
// export const model = new ChatGoogleGenerativeAI({
//     modelName: "gemini-pro",
//     apiKey: process.env.OPENAI_API_KEY,
//     temperature: 0.7,
//     maxOutputTokens: 2048,
// });
// console.log("✅ Gemini model initialized successfully");


import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq"

// if (!process.env.OPENAI_API_KEY) {
//     throw new Error("❌ OPENAI_API_KEY is missing. Please add it to your .env.local file");
// }

// export const model = new ChatOpenAI({
//     modelName: "gpt-4",
//     apiKey: process.env.OPENAI_API_KEY,
//     temperature: 0.7,
//     maxTokens: 2048,
// });

// console.log("✅ OpenAI model initialized successfully");


if (!process.env.GROQ_API_KEY) {
    throw new Error("❌ GROQ_API_KEY is missing. Please add it to your .env file")
}


export const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    maxTokens: 2048,
})