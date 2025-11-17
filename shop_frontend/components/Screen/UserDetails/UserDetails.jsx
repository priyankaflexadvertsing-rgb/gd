import React, { useEffect, useState } from 'react'
import { convertPrintingToFiles, FileViewer } from '../../FileViewer'
import { SummaryTable } from '../../SummaryTable';

import useStore from '../../../store/store';
import Sidebar from '../../global/Sidebar';

const UserDetails = () => {
    const user = useStore((state) => state.user);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [allFiles, setAllFiles] = useState([]);
    const [customerFiles, setCustomerFiles] = useState([]);
    const printingFiles = convertPrintingToFiles(user.printing);



    useEffect(() => {
        const loadData = async () => {
            const [files, customers] = await Promise.all([
                fetchAllFiles(),
            ]);

            if (files?.length) {
                setCustomerFiles(files);
            }

            if (customers) setCustomerData(customers);
        };

        loadData();
    }, []);


    const fetchAllFiles = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/v2/files");
            const json = await res.json();
            if (res.ok) {
                setAllFiles(json.data);
                return json.data;
            } else {
                console.error("File fetch failed:", json);
            }
        } catch (err) {
            console.error("Error fetching files:", err);
        }
    };

    const fetchCustomerData = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/usedata");
            const json = await res.json();
            return res.ok ? json.data : [];
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    };

    const fetchCustomerPrinting = async (name) => {
        try {
            const res = await fetch(`http://localhost:3000/api/userPrinting?name=${name}`);
            const json = await res.json();
            return res.ok ? json.data : [];
        } catch (err) {
            console.error("Error fetching printing data:", err);
        }
    };

    const PostfetchAmount = async (images, rate, id) => {
        if (!images?.length) return setCalculatedAmount([]);

        try {
            const res = await fetch("http://localhost:3000/api/calculateCustomerAmount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images, user: { sheetRate: rate }, id }),
            });
            const json = await res.json();
            if (res.ok) setCalculatedAmount(json.data);
        } catch (err) {
            console.error("Error calculating amount:", err);
        }
    };

    const putUserData = (updatedCustomer) => {
        fetch(`http://localhost:3000/api/usedata/${updatedCustomer.name.replace(".json", "")}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ printing: updatedCustomer.printing }),
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.success) fetchCustomerData().then(setCustomerData);
            })
            .catch(console.error);
    };

    const handleCustomerClick = async (customer) => {
        setSelectedCustomer(customer);
        const files = await fetchCustomerPrinting(customer.name);
        setCustomerFiles(files || []);
        PostfetchAmount(files || [], customer.rate, customer.name.replace(".json", ""));
    };

    const handleCreateCustomer = async (newCustomer) => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/createcustomer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCustomer),
            });

            const json = await res.json();
            if (res.ok) {
                alert("Customer created successfully!");
                setShowModal(false);
                setErrorMsg("");
                fetchCustomerData().then(setCustomerData);
            } else {
                setErrorMsg(json.message || "Failed to create customer.");
            }
        } catch (err) {
            setErrorMsg("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className='flex min-w-screen overflow-x-hidden min-h-screen'>
            <Sidebar user={user} />

            <div className='w-[100%]'>
                <h2 className="text-xl text-center font-bold my-4">
                    Order Summary for <span className='text-red-600 text-3xl'>{user.name.replace(".json", "") || "Guest"}</span>
                </h2>
                <div className="flex">
                    <FileViewer files={printingFiles} name={user.name} />
                    <SummaryTable printing={user.printing} name={user.name} />
                </div>
            </div>


        </div>
    )
}

export default UserDetails
