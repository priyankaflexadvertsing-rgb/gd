import { sendMail } from "../../../utils/sendMail.js";
import jwt from "jsonwebtoken";
import FilesService, { file_Path } from "./file.js";
import { sendToken } from "../../../utils/jwt.js";
import { oringinal_printing_files } from "../../../config/fileConfing.js";
import PaymentsService from "../payments/calculateUserAmount.js";
const ACTIVATION_SECRET = "fO37t-dSocIp9bd5wup]@X&4heyC_6nN{AWE'sLuRLc4]R9oUt";
import path from "path"

export const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    ACTIVATION_SECRET,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

class UserService {
  static async registerUser(payload, res) {
    try {
      const { name, email, password } = payload;

      if (!email || !password) {
        return res
          .status(400)
          .json({ type: "error", message: "Please enter email & password" });
      }
      const userFile = await FilesService.getUserFileByEmail({ email: email });

      if (userFile) {
        return res
          .status(400)
          .json({ type: "error", message: "User alerady exist" });
      }

      const user = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };
      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.email} to activate your account!`,
          activationToken: activationToken.token,
        });
      } catch (error) {
        res.status(201).json({
          success: false,
          message: `${error.message}`,
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ type: "error", message: "Internal Server Error" });
    }
  }

  static async activateAccount(payload, res) {
    try {
      const { token, code } = payload;
      const newUser = jwt.verify(token, ACTIVATION_SECRET);
     

      if (newUser.activationCode !== code) {
        res.status(400).json({ message: "invaild code" });
      }

      const { name, email, password } = newUser.user;

      await FilesService.createUserFile({
        userId: Math.random().toString(36).substring(2, 15) + name,
        name,
        email,
        password,
        printing: [],
        excelfiles: [],
        rate: {},
      });

      res.status(201).json({
        success: true,
        message: "Account has been activated!",
      });
    } catch (error) {
      res.status(400).json({ success: false, message: `${error.message}` });
    }
  }

  static async loginUser(payload, res) {
    try {
      const { email, password } = payload;

      if (!email || !password) {
        return res
          .status(400)
          .json({ type: "error", message: "Please enter email & password" });
      }

      // Check if the user already exists
      const userFile = await FilesService.getUserFileByEmail({ email: email });

      if (!userFile) {
        return res
          .status(400)
          .json({ type: "error", message: "User not found" });
      }
      if (userFile.password !== password) {
        return res
          .status(400)
          .json({ type: "error", message: "Invalid credentials" });
      }

      sendToken(userFile, res);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ type: "error", message: "Internal Server Error" });
    }
  }

  static async getUserById(payload) {
    const { userId } = payload;
    const userFile = await FilesService.getUserFileById({ userId: userId });
    return userFile;
  }



static async updateUserFile(payload, files) {
  const { id } = payload;

  // Load user
  const userFile = await FilesService.getUserFileById({ userId: id });
  if (!userFile) throw new Error("User not found");

  // Ensure printing array exists
  if (!Array.isArray(userFile.printing)) {
    userFile.printing = [];
  }

  for (const file of files) {
    const {
      fieldname,
      originalname,
      encoding,
      mimetype,
      destination,
      filename,
      path: inputFilePath,
      size,
    } = file;

    // 1️⃣ Compress uploaded file
    const compressedFilePath = await FilesService.compressImagesFiles(inputFilePath);
    if (!compressedFilePath) {
      console.error("❌ Compression failed, skipping file:", inputFilePath);
      continue;
    }

    // 2️⃣ Use platform-safe original path
    const originalfilePath = path.join(destination, filename);

    // 3️⃣ Calculate payment for THIS FILE ONLY
    const payment_details = await PaymentsService.calculateUserAmount({
      printing: [{
        fieldname,
        originalname,
        mimetype,
        size,
      }],
      rate: userFile.rate
    });

    // 4️⃣ Add to printing history
    const newPrintingData = {
      originalfilePath,
      compressedfilePath: compressedFilePath,
      fieldname,
      originalname,
      payment_details,
      date: new Date(),
      encoding,
      mimetype,
      size,
    };

    userFile.printing.push(newPrintingData);
  }

  // 5️⃣ Save updated user file
  return await FilesService.updateUserFile(userFile);
}


}

export default UserService;
