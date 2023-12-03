const Order = require('../models/order');
const responseUtils = require('../utils/responseUtils');

const getAllOrders = async (response) => {
    const orders = await Order.find({}).exec();
    return responseUtils.sendJson(response, orders);
};

const getUserOrders = async (response, currentUser) => {
  const orders = await Order.find({ customerId: currentUser._id }).populate('customerId');
  return responseUtils.sendJson(response, orders);
};

const viewOrder = async (response, orderId, currentUser) => {
    const order = await Order.findById(orderId).exec();
    if (!order) {
      return responseUtils.notFound(response);
    }
    if (currentUser._id !== order.customerId) {
      return responseUtils.notFound(response);
    }

    return responseUtils.sendJson(response, order);
};

const registerOrder = async (response, orderData) => {
    if (!orderData.customerId || !orderData.items || orderData.items.length === 0 || orderData.items === undefined) {
      return responseUtils.badRequest(response, "Incomplete order data");
    }

    const newOrder = new Order({...orderData, customerId: currentUser._id});
    await newOrder.save();
    return responseUtils.sendJson(response, newOrder, 201);
};

module.exports = { getAllOrders, getUserOrders, registerOrder, viewOrder };
