import express from "express";
import cors from "cors";
import { getAllPrinting, uploadPrinting } from "./src/controller/printing.js";
import { registerUser, activateAccount, loginUser, getUser, getAllUsers } from "./src/controller/user.js";
import { upload } from "./src/utils/multer.js";
import path from "path";
import { paymentDetails } from "./src/controller/payment.js";
import { authorizeRoles, isAuthenticated } from "./src/middleware/auth.js";
import cookieParser from "cookie-parser";
import { compressed_printing_files } from "./src/config/fileConfing.js";

const app = express();
const port = 8000;

app.use(cors({
  origin: "http://localhost:5173", // removed trailing slash
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use("/thumbnails", express.static(compressed_printing_files));
app.set("view engine", "ejs");
app.set("views", path.resolve("./src/mails"));


// app.use("/thumbnails", express.static(thumbnailDir));

// user signup API
app.post("/api/v2/signup", registerUser);
app.post("/api/v2/activateAccount", activateAccount);
app.post("/api/v2/login", loginUser);
app.get("/api/v2/getUser", isAuthenticated, getUser);
app.get("/api/v2/getAllUsers", isAuthenticated, authorizeRoles("admin"), getAllUsers);
app.get("/api/v2/files", isAuthenticated, getAllPrinting);

// printing upload API
app.post("/api/v2/uploadPrint", isAuthenticated, upload.array('images'), uploadPrinting); // allow multiple
app.get("/api/v2/payments/details", isAuthenticated, paymentDetails); // fixed typo

// home screen page
app.get("/", (req, res) => {
  res.render("022", { title: "Welcome to Flex Shop Management System" });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
