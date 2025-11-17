import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN || "youraccesstokensecret";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN || "yourrefreshtokensecret";

// Token expiry durations
// Access token expiration (in milliseconds)
const accessTokenExpire = (parseInt(process.env.REFRESH_TOKEN_EXPIRE, 10) || 12) * 60 * 60 * 1000;
// Refresh token expiration (in milliseconds)
const refreshTokenExpire = (parseInt(process.env.ACCESS_TOKEN_EXPIRE, 10) || 12) * 60 * 60 * 1000;



// Access token cookie options
export const accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire),
    maxAge: accessTokenExpire,
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
};

// Refresh token cookie options
export const refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire),
    maxAge: refreshTokenExpire,
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
};
export const SignAccessToken = (id) => jwt.sign({ id: id }, ACCESS_TOKEN_SECRET || "", { expiresIn: "5m" });
export const SignRefreshToken = (id) => jwt.sign({ id: id }, REFRESH_TOKEN_SECRET || "", { expiresIn: "3d" });

export const sendToken = async (user, res) => {
    const { userId } = user;

    try {
        const accessToken = SignAccessToken(userId);
        const refreshToken = SignRefreshToken(userId);
        const token = "";

        res.cookie("accessToken", accessToken, accessTokenOptions);

        res.cookie("refreshToken", refreshToken, refreshTokenOptions);

        return res.status(200).json({
            success: true,
            user,
            token,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Token generation failed",
            error: error.message,
        });
    }
};
