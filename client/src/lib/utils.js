import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(image) {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  const cleanPath = image.replace(/\\/g, "/").replace(/^\/+/, "");
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";
  return `${baseUrl}/${cleanPath}`;
}
