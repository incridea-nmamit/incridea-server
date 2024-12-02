// import { v2 as cloudinary } from "cloudinary";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";

// import { env } from "~/env";

// cloudinary.config({
//   cloud_name: env.CLOUDINARY_CLOUD_NAME,
//   api_key: env.CLOUDINARY_API_KEY,
//   api_secret: env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// const params = {
//   folder: "IDs",
//   allowed_formats: ["jpeg", "jpg", "png"],
// };

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params,
// });

// export const config = { cloudinary, upload: multer({ storage }) };
