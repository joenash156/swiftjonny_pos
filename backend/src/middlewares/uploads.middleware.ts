import multer from "multer";
import path from "path";



const storage = multer.diskStorage({
  destination: (req: Express.Request, _file: Express.Multer.File, cb) => {
    let folder = "uploads";

    if (req.uploadType === "avatar") {
      folder = "uploads/avatars";
    }

    if (req.uploadType === "product") {
      folder = "uploads/products";
    }

    cb(null, path.join(__dirname, "..", "..", folder));
  },

  filename: (_req: Express.Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter: multer.Options["fileFilter"] = (_req: Express.Request, file: Express.Multer.File, cb:multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export default upload;
