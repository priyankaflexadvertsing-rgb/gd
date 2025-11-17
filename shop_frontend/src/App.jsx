import { useEffect, useState } from "react";
import { CreateCustomerModal } from "../components/CreateCustomerModal";
import { FileViewer } from "../components/FileViewer";
import { SummaryTable } from "../components/SummaryTable";
import { CustomerList } from "../components/Customerlist";
import UploadPrinting from "../components/UploadPrinting";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/global/Navbar";
import AuthForm from "../components/Auth/Auth";
import Hero from "../components/Screen/Home/Hero";
import Verification from "../components/Auth/Verification";
import useStore from "../store/store";
import UserDetails from "../components/Screen/UserDetails/UserDetails";
import AllUser from "../components/Admin/User/AllUser";


function App() {
 
 
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state)=>state.user)


  const getUserData = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v2/getUser", {
        credentials: "include",
      });
      const json = await res.json();
      setUser(json.user);
      if (res.ok) {
        setCustomerData(json.data);
      } else {
        console.error("Failed to fetch user data:", json);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

useEffect(() => {
    getUserData();
  }, []);




  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/verification" element={<Verification length={4}  />} />
          <Route path="/userDetails" element={<UserDetails />} />
          <Route path="/upload-printing" element={<UploadPrinting />} />
          <Route path="/AllUser" element={<AllUser user={user} />} />
          <Route path="/auth" element={<AuthForm />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>

    // <>
    //   <Navbar />
    //   <div className="bg-black min-w-screen min-h-screen text-white">
    //     <div className="w-full h-full">
    //      

    //       <CustomerList
    //         fetchAllFiles={fetchAllFiles}
    //         customers={customerData}
    //         onCustomerClick={handleCustomerClick}
    //         onDropFile={putUserData}
    //         onCreateClick={() => setShowModal(true)}
    //       />

    //       <FileViewer
    //         files={customerFiles}
    //         allFiles={allFiles}
    //         selectedCustomer={selectedCustomer}
    //       />

    //       <SummaryTable
    //         calculatedAmount={calculatedAmount}
    //         selectedCustomer={selectedCustomer}
    //       />
    //     </div>

    //     {showModal && (
    //       <CreateCustomerModal
    //         isLoading={isLoading}
    //         errorMsg={errorMsg}
    //         onClose={() => setShowModal(false)}
    //         onCreate={handleCreateCustomer}
    //       />
    //     )}
    //   </div>
    // </>
  );
}

export default App;
