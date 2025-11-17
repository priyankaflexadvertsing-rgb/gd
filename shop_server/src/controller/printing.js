import UserService from "../service/web/user/user.js";
import FilesService from "../service/web/user/file.js";


export const uploadPrinting = async (req, res) => {

    const dd = await UserService.updateUserFile(req.user, req.files);

    if (dd) {
        return res.status(200).json({ message: `File uploaded successfully`, data: dd });
    } else {
        return res.status(500).json({ message: `error is uploading file` });
    }

};


export const getAllPrinting = async (req, res) => {
    const dd = await FilesService.getAllPrintingFiles();

    if (dd) {
        return res.status(200).json({ message: `Files`, data: dd });
    } else {
        return res.status(500).json({ message: `error is uploading file` });
    }
}