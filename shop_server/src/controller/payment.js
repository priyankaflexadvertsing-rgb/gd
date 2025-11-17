import PaymentsService from "../service/web/payments/calculateUserAmount.js";



export const paymentDetails = async (req, res) => {
    PaymentsService.calculateUserAmount(req.user, res)
};