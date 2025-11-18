import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../../store/store";
import { SERVER_URI } from "../../uri/uril";



const AuthForm = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        shop_name: "",
        phoneNumber: "",
        address: "",
        email: "",
        password: "",
    });
    const setUser = useStore((state) => state.setUser);
    const setToken = useStore((state) => state.setToken);
    // Handle field changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isLogin) {
                // 🔹 LOGIN FUNCTION
                const loginData = {
                    email: formData.email,
                    password: formData.password,
                };

                const response = await fetch(`${SERVER_URI}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loginData),
                    credentials: "include", // ensures cookies (HTTP-only) are sent and received
                });

                const result = await response.json();
                setUser(result.user);

                if (result.success) {
                    navigate("/", { replace: true });
                } else {
                    alert(`Login failed: ${result.message || "Invalid credentials"}`);
                }
            } else {
                // 🔹 SIGNUP FUNCTION
                const signupData = {
                    name: formData.name,
                    shop_name: formData.shop_name,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    email: formData.email,
                    password: formData.password,
                };

                const response = await fetch(`${SERVER_URI}/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(signupData),
                });

                const result = await response.json();
                console.log(result);
                await setToken(result.activationToken);
                if (result.success) {
                    navigate("/verification", { replace: true });
                    alert("Sign Up successful!");
                    console.log("User signed up:", result);
                    setIsLogin(true);
                } else {
                    alert(`Sign Up failed: ${result.message || "Try again later"}`);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please check your connection.");
        }
    };


    return (
        <div className={`flex justify-center items-center ${!isLogin ? "min-h-screen" : "h-[90vh]"} bg-gray-100 px-4`}>
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-center text-black mb-6">
                    {isLogin ? "Login" : "Sign Up"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-2">
                    {!isLogin && (
                        <>
                            <div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                                    />
                                </div>

                                {/* Shop Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Shop Name
                                    </label>
                                    <input
                                        type="text"
                                        name="shop_name"
                                        value={formData.shop_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                                    />
                                </div>

                            </div>


                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                                />
                            </div>
                        </>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white font-semibold py-2 rounded-md hover:bg-gray-800 transition"
                    >
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                {/* Toggle Between Sign Up / Login */}
                <p className="text-center text-gray-600 text-sm mt-4">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-black font-medium hover:underline"
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;
