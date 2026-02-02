import fs from "fs";
import path from "path";

/**
 * Delete a file from the system
 * @param folder - the folder inside uploads, e.g., "avatars"
 * @param filename - the name of the file to delete
 */

export const deleteFile = (folder: string, filename: string) => {
  const filePath = path.join(__dirname, "..", "..", "uploads", folder, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.warn("File not found, nothing to delete:", filePath);
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file:", filePath, err);
      else console.log("Deleted file:", filePath);
    });
  });
};
