import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const SummaryTable = ({ printing, name }) => {

    const timestampToDate = (ts) => {
        if (!ts) return "";
        const d = new Date(ts);
        return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}-${d.getFullYear()}`;
    };

    const allItems = printing.flatMap(entry => entry.payment_details.items);

    const totals = allItems.reduce(
        (acc, item) => {
            acc.price += Number(item.price) || 0;
            acc.quantity += Number(item.quantity) || 0;
            acc.squareFeet += Number(item.squareFeet) || 0;
            return acc;
        },
        { price: 0, quantity: 0, squareFeet: 0 }
    );

    const exportToExcel = () => {
        const data = printing.map((item, i) => ({
            No: i + 1,
            Size: item.size,
            Quantity: item.quantity,
            Sqft: Number(item.squareFeet).toFixed(2),
            Sheet: item.sheet,
            Price: Number(item.price).toFixed(2),
            File: item.imageFormat,
            Date: timestampToDate(item.timestamp),
        }));

        // Add totals row
        data.push({
            No: "",
            Size: "Total",
            Quantity: totals.quantity,
            Sqft: totals.squareFeet.toFixed(2),
            Sheet: "",
            Price: totals.price.toFixed(2),
            File: "",
            Date: "",
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");

        // Save file
        const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });

        saveAs(
            blob,
            `${selectedCustomer?.name?.replace(".json", "") || "Guest"}-summary.xlsx`
        );
    };


    return (
        <div className="w-[45%] mr-4">
           

            {/* <button
                onClick={exportToExcel}
                className="mb-4 mt-4 fixed right-5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Download Excel
            </button> */}

            <table className="w-full  text-sm table-auto border-collapse">
                <thead>
                    <tr className="bg-gray-700 text-white">
                        <th className="p-2 border">No.</th>
                        <th className="p-2 border">Size</th>
                        <th className="p-2 border">Qty</th>
                        <th className="p-2 border">Sqft</th>
                        <th className="p-2 border">Sheet</th>
                        <th className="p-2 border">Price</th>
                        <th className="p-2 border">File</th>
                        <th className="p-2 border">Date</th>
                    </tr>
                </thead>

                <tbody className="text-center">
                    {printing.length !== 0 ? (
                        <>
                            {allItems.map((it, idx) => (
                                <tr key={idx} className="bg-gray-800 text-white hover:bg-gray-700">
                                    <td className="p-2 border">{idx + 1}</td>
                                    <td className="p-2 border">{it.size}</td>
                                    <td className="p-2 border">{it.quantity}</td>
                                    <td className="p-2 border">{Number(it.squareFeet).toFixed(2)}</td>
                                    <td className="p-2 border">{it.sheet}</td>
                                    <td className="p-2 border">₹ {Number(it.price).toFixed(2)}</td>
                                    <td className="p-2 border">{it.imageFormat}</td>
                                    <td className="p-2 border">{timestampToDate(it.timestamp)}</td>
                                </tr>
                            ))}

                            <tr className="bg-gray-600 text-white font-bold">
                                <td className="p-2 border" colSpan={2}>Total</td>
                                <td className="p-2 border">{totals.quantity}</td>
                                <td className="p-2 border">{totals.squareFeet.toFixed(2)}</td>
                                <td className="p-2 border">-</td>
                                <td className="p-2 border">₹ {totals.price.toFixed(2)}</td>
                                <td className="p-2 border">-</td>
                                <td className="p-2 border">-</td>
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <td colSpan="8" className="p-2 border">No items to calculate.</td>
                        </tr>
                    )}

                </tbody>
            </table>
        </div>
    );
};
