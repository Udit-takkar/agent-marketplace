import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GOLDRUSH_API_KEY = process.env.NEXT_PUBLIC_GOLDRUSH_API_KEY;

if (!GOLDRUSH_API_KEY) {
  console.warn("GOLDRUSH_API_KEY is not defined in environment variables");
}

// TODO: Move Open API Key to server side so can;t be access on the client side
export const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not defined in environment variables");
}
