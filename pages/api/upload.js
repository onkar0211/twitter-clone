// import multiparty from 'multiparty';
// import S3 from 'aws-sdk/clients/s3';
// import fs from 'fs';
// import {initMongoose} from "../../lib/mongoose";
// import {unstable_getServerSession} from "next-auth";
// import {authOptions} from "./auth/[...nextauth]";
// import User from "../../models/User";
// export default async function handle(req, res) {
//   await initMongoose();
//   const session = await unstable_getServerSession(req, res, authOptions);

//   const s3Client = new S3({
//     region: 'us-east-1',
//     credentials: {
//       accessKeyId: process.env.S3_ACCESS_KEY,
//       secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//     },
//   });

//   const form = new multiparty.Form();
//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       throw err;
//     }
//     const type = Object.keys(files)[0];
//     const fileInfo = files[type][0];
//     const filename = fileInfo.path.split('/').slice(-1)[0];
//     s3Client.upload({
//       Bucket: 'dawid-twitter-clone',
//       Body: fs.readFileSync(fileInfo.path),
//       ACL: 'public-read',
//       Key: filename,
//       ContentType: fileInfo.headers['content-type'],
//     }, async (err,data) => {
//       if (type === 'cover' || type === 'image') {
//         await User.findByIdAndUpdate(session.user.id, {
//           [type]:data.Location,
//         });
//       }

//       fs.unlinkSync(fileInfo.path);
//       res.json({files,err,data,fileInfo,src:data.Location});
//     });
//   });
// }

// export const config = {
//   api: {
//     bodyParser: false,
//   }
// };




// import { getServerSession } from "next-auth/next";
// import { authOptions } from "./auth/[...nextauth]";
// import formidable from "formidable";
// import path from "path";
// import { v2 as cloudinary } from "cloudinary";
// import { initMongoose } from "../../lib/mongoose";
// import User from "../../models/User";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Tell Next.js not to parse body (form-data)
// export const config = { api: { bodyParser: false } };

// const parseForm = (req) =>
//   new Promise((resolve, reject) => {
//     const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 }); // 10MB
//     form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
//   });

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     res.setHeader("Allow", ["POST"]);
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   await initMongoose();
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });

//   try {
//     const { fields, files } = await parseForm(req);

//     // We accept any of these field names from the client:
//     // 'file' (generic), 'image', 'cover', or 'post' (your prior component)
//     const fileField = files.file || files.image || files.cover || files.post;
//     if (!fileField) return res.status(400).json({ error: "No file provided" });

//     const file = Array.isArray(fileField) ? fileField[0] : fileField;
//     const filepath = file.filepath || file.path; // formidable v2 uses filepath

//     // Validate mime
//     const contentType = file.mimetype || file.headers?.["content-type"] || "";
//     if (!/^image\//.test(contentType)) {
//       return res.status(400).json({ error: "Only image uploads are allowed" });
//     }

//     // Decide what user field to update (avatar/cover) based on a 'type' field
//     // or derive from the field name. This fixes your earlier mismatch.
//     const type =
//       (fields.type && String(fields.type)) ||
//       (files.cover ? "cover" : files.image ? "image" : null);

//     // Upload to Cloudinary
//     const uploadResult = await cloudinary.uploader.upload(filepath, {
//       folder: "twitter-clone",
//       resource_type: "image",
//       // eager transformations/thumbs etc. can go here
//     });

//     // Optionally update user record if type is provided
//     if (type === "cover" || type === "image") {
//       await User.findByIdAndUpdate(session.user.id, { [type]: uploadResult.secure_url });
//     }

//     return res.status(200).json({
//       src: uploadResult.secure_url,
//       // meta you might use on the client
//       width: uploadResult.width,
//       height: uploadResult.height,
//       format: uploadResult.format,
//     });
//   } catch (err) {
//     console.error("[/api/upload] error:", err);
//     return res.status(500).json({ error: "Upload failed" });
//   }
// }





import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import formidable from "formidable";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { initMongoose } from "../../lib/mongoose";
import User from "../../models/User";
import crypto from "crypto";

export const config = { api: { bodyParser: false } };

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 }); // 10MB
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  await initMongoose();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });

  try {
    const { fields, files } = await parseForm(req);
    const fileField = files.file || files.image || files.cover || files.post;
    if (!fileField) return res.status(400).json({ error: "No file provided" });

    const file = Array.isArray(fileField) ? fileField[0] : fileField;
    const tmpPath = file.filepath || file.path;
    const contentType = file.mimetype || file.headers?.["content-type"] || "";

    if (!/^image\//.test(contentType)) {
      return res.status(400).json({ error: "Only image uploads are allowed" });
    }

    // Ensure uploads dir exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fsp.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.originalFilename || file.newFilename || "");
    const safeExt = ext && ext.length <= 8 ? ext : ".jpg";
    const name = crypto.randomBytes(16).toString("hex") + safeExt;

    const destPath = path.join(uploadsDir, name);

    // Move file from temp to public/uploads (stream for large files)
    await fsp.copyFile(tmpPath, destPath);
    try { await fsp.unlink(tmpPath); } catch {}

    const publicUrl = `/uploads/${name}`;

    const type =
      (fields.type && String(fields.type)) ||
      (files.cover ? "cover" : files.image ? "image" : null);

    if (type === "cover" || type === "image") {
      await User.findByIdAndUpdate(session.user.id, { [type]: publicUrl });
    }

    return res.status(200).json({ src: publicUrl });
  } catch (err) {
    console.error("[/api/upload local] error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
