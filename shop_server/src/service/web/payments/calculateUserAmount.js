import FilesService from "../user/file.js";
import { flexPrint } from "./flexprint.js";

class PaymentsService {
 static async calculateUserAmount({ printing, rate }) {
  if (!Array.isArray(printing) || printing.length === 0) {
    return {
      success: false,
      message: "No printing item provided",
      totalAmount: 0,
      items: [],
    };
  }

  if (!rate || typeof rate !== "object") {
    return {
      success: false,
      message: "Rate configuration missing",
      totalAmount: 0,
      items: [],
    };
  }

  // flexPrint returns an array of price-calculated items
  const items = await flexPrint(printing, rate);

  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.amount || 0);
  }, 0);

  return {
    success: true,
    totalAmount,
    items,
  };
}

}


export default PaymentsService;
