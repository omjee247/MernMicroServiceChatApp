import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';

dotenv.config();

// const {
//   CLOUDINARY_NAME,
//   CLOUDINARY_API_KEY,
//   CLOUDINARY_API_SECRET,
// } = process.env;

// if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
//   throw new Error("Missing Cloudinary environment variables");
// }

// cloudinary.config({
//   cloud_name: CLOUDINARY_NAME,
//   api_key: CLOUDINARY_API_KEY,
//   api_secret: CLOUDINARY_API_SECRET,
// });

//----- Uppper one is recommended but I am using the below one  ----

//----- The ! is called the non-null assertion operator. -------
//----- TypeScript does not check your .env file, so without !, these are typed as: string | undefined ----
//----  Cloudinary expects only string. ------

// --- When ! is acceptable ----

// Using ! is okay only if:

// You are 100% sure the variable exists

// You are in early development

// You don’t mind runtime crashes if .env is wrong


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


export default cloudinary;