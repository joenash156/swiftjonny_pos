import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
  // get the destination of the file
  destination: (_req: Express.Request, _file: Express.Multer.File, cb) => {
    try {
      cb(null, path.join(__dirname, "..", "..", "uploads", "avatars"));

    } catch(err: unknown) {
      cb(err as Error, "");
    }
  },

  // get the filename
  filename: (_req: Express.Request, file: Express.Multer.File, cb) => {
    try {
      // get the file extension
      const ext = path.extname(file.originalname);
      const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
      cb(null, uniqueFileName)

    } catch(err: unknown) {
        cb(err as Error, "");
    }
  }
})

// file filter
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb:multer.FileFilterCallback) => {
  // get allowed mine types
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];

   // check if file mine type is accepted
  if(allowedTypes.includes(file.mimetype)) {
    cb(null, true)

  } else {
    cb(new Error("Only image files are allowed!"))
  }
}

// get file limit uploadable
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
}

const upload = multer({
  storage,
  fileFilter,
  limits
});

export default upload