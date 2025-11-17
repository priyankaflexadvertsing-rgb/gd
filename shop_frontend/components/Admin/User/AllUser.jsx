import React, { useState, useEffect } from "react";
import Sidebar from "../../global/Sidebar";
import { convertPrintingToFiles, FileViewer } from '../../FileViewer'
import { SummaryTable } from '../../SummaryTable';

const AllUser = ({ user }) => {
    const [data, setData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);


    const getAllUserData = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/v2/getAllUsers", {
                credentials: "include",
            });
            const json = await res.json();

            if (res.ok) {
                setData(json.users || []);
            } else {
                console.error("Failed to fetch user data:", json);
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    useEffect(() => {
        getAllUserData();
    }, []);

    return (
        <div className="flex w-screen min-h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={user} />

            {/* Main content */}
            <div className="flex flex-col flex-1 ml-[16rem] p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    All Users
                    {/* <span className="text-red-600 text-3xl">
                        {user?.name?.replace(".json", "") || "Guest"}
                    </span> */}
                </h2>

                {/* Users list */}
                <div className="w-full">
                    {data.length === 0 ? (
                        <p className="text-gray-500 text-center col-span-full">
                            No users found.
                        </p>
                    ) : (
                        data.map((item, index) => (
                            <div
                                key={item._id || index}
                                className=" p-3 rounded-xl mb-2 shadow-sm border border-orange-200 flex flex-col justify-between hover:shadow-lg transition"
                            >
                                <div className="flex items-center justify-between ">
                                    <h3 className="text-xl font-semibold text-gray-700">
                                        {item.name}
                                    </h3>
                                    <p className="text-gray-500 ">
                                        <span className="font-semibold">Email:</span> {item.email}
                                    </p>
                                    <p className="text-gray-500 ">
                                        <span className="font-semibold">Joined:</span>{" "}
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                    <button
                                        className=" bg-red-600 hover:bg-red-700 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg transition"
                                        onClick={() => setSelectedUser(item)}
                                    >
                                        View Details
                                    </button>
                                </div>



                                {/* User Details Modal */}
                                {selectedUser && (
                                    <div className="flex">
                                        <FileViewer files={convertPrintingToFiles(item.printing)} name={item.name} />
                                        <SummaryTable printing={item.printing} name={item.name} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>


            </div>
        </div>
    );
};

export default AllUser;
