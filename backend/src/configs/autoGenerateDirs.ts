import fs from "fs";
import path from "path";

export const autoGenerateUploadDirs = (): void => {
  const baseDir = path.join(__dirname, "..", "..", "uploads");

  const folders = [
    baseDir,
    path.join(baseDir, "avatars"),
    path.join(baseDir, "products")
  ];

  for (const folder of folders) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }
};
