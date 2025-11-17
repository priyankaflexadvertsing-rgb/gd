import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { exiftool } from "exiftool-vendored";

import { baseDir, compressed_printing_files } from "../../../config/fileConfing.js";
import ReadDirRecursive, { generateThumbnail, normalizeFileName } from "./readdirrecursive.js";


export const file_Path = (name) => path.join(baseDir, `${name}.json`);

class FilesService {
  static async createUserFile(payload) {

    const { userId, name, email, password, printing, rate, excelfiles } = payload;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Customer name is required." });
    }
    const trinmedName = name.trim();
    const filePath = file_Path(trinmedName);

    const data = {
      userId: userId,
      role: "user",
      name: name,
      email: email,
      password: password,
      printing: printing,
      excelfiles: excelfiles,
      rate: rate,
      CrateDate: new Date().toISOString(),
    }

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return data
    } catch (err) {
      return err.message
    }

  }

  static async compressImagesFiles(inputFilePath) {
  try {
    if (!fs.existsSync(inputFilePath)) {
      throw new Error(`File does not exist: ${inputFilePath}`);
    }

    const ext = path.extname(inputFilePath).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".tif", ".tiff"].includes(ext)) {
      throw new Error("Unsupported file type for compression");
    }

    const parsed = path.parse(inputFilePath);

    // Normalize file name
    const cleanName = normalizeFileName(parsed.name) + ".jpg";

    // Output directory + file
    const outputPath = path.join(
      compressed_printing_files,
      cleanName
    );

    // If file already compressed → skip
    if (fs.existsSync(outputPath)) {
      console.log(`⚡ Skipping compression (already exists): ${outputPath}`);
      return outputPath;
    }

    // Generate thumbnail / compression
    await generateThumbnail(inputFilePath, outputPath);

    await exiftool.end();

    return outputPath;

  } catch (err) {
    console.error("❌ Compression failed:", err);
    throw err;
  }
}




  static async getUserFileByEmail(payload) {
    const { email } = payload;

    try {
      const files = fs.readdirSync(baseDir, { withFileTypes: true });

      for (const file of files) {
        if (file.isFile() && file.name.endsWith(".json")) {
          const filePath = path.join(baseDir, file.name);
          const content = fs.readFileSync(filePath, "utf-8");

          try {
            const jsonData = JSON.parse(content);


            if (jsonData.email === email) {
              return jsonData;
            }
          } catch (parseError) {
            console.error(`Error parsing ${file.name}:`, parseError);
          }
        }
      }

      // If no file matches the email
      return null;

    } catch (err) {
      console.error("Error reading user files:", err);
      return null;
    }
  }

  static async getUserFileById(payload) {
    const { userId } = payload;




    try {
      const files = fs.readdirSync(baseDir, { withFileTypes: true });

      for (const file of files) {
        if (file.isFile() && file.name.endsWith(".json")) {
          const filePath = path.join(baseDir, file.name);
          const content = fs.readFileSync(filePath, "utf-8");

          try {
            const jsonData = JSON.parse(content);


            if (jsonData.userId === userId) {
              return jsonData;
            }
          } catch (parseError) {
            console.error(`Error parsing ${file.name}:`, parseError);
          }
        }
      }

      // If no file matches the email
      return null;

    } catch (err) {
      console.error("Error reading user files:", err);
      return null;
    }
  }

  static async getAllUsersFiles() {
    const userFiles = [];

    try {
      // Read all files/directories in baseDir
      const files = await fsPromises.readdir(baseDir, { withFileTypes: true });


      for (const file of files) {
        // Only process .json files
        if (file.isFile() && file.name.endsWith(".json")) {
          const filePath = path.join(baseDir, file.name);

          try {
            const content = await fsPromises.readFile(filePath, "utf-8");
            const jsonData = JSON.parse(content);
            userFiles.push(jsonData);
          } catch (parseError) {
            console.error(`❌ Error parsing ${file.name}:`, parseError.message);
          }
        }
      }
    } catch (err) {
      console.error("❌ Error reading user files:", err.message);
      return [];
    }

    return userFiles;
  }

  static async updateUserFile(payload) {
    const { name } = payload;
    const trinmedName = name.trim();
    const filePath = file_Path(trinmedName);


    try {
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));


      return payload
    } catch (err) {
      return err.message
    }
  }

  static async getAllPrintingFiles() {
    const files = ReadDirRecursive.readDirectoryRecursive(compressed_printing_files);
    return files;
  }
}
export default FilesService;