// import { Request, Response } from "express";

// export async function uploader(req: Request, res: Response) {
//   try {
//     if (!req.file) {
//       res.status(400).json({ message: "No file uploaded" });
//       return;
//     }

//     res.status(200).json({
//       message: "File uploaded successfully",
//       url: req.file.path,
//     });
//   } catch (err: any) {
//     console.log(err);
//     res.status(500).json("Internal Server Error");
//   }
// }
