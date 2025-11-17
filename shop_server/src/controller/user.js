import FilesService from "../service/web/user/file.js";
import UserService from "../service/web/user/user.js";


export const registerUser = async (req, res) => {
  UserService.registerUser(req.body, res);
};

export const activateAccount = async (req, res) => {
  UserService.activateAccount(req.body, res);
};


export const loginUser = async (req, res) => {
  UserService.loginUser(req.body, res);
};

export const getUser = async (req, res) => {
  FilesService.getUserFileById({ userId: req.user.id }).then((user) => {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json({ success: true, user });
    }
  }).catch((error) => {
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  });
};


export const getAllUsers = async (req, res) => {
  FilesService.getAllUsersFiles().then((users) => {
    return res.status(200).json({ success: true, users });
  }).catch((error) => {
    return res.status(500).json({ message: "kkgg" || "Internal Server Error" });
  });
}