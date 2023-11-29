const Order = require('../models/order');
const responseUtils = require('../utils/responseUtils');

const getAllOrders = async (response) => {
    const orders = await Order.find({});
    return responseUtils.sendJson(response, orders);
};

const viewOrder = async (response, orderId, currentUser) => {
    const order = await Order.findById(orderId).exec();
    if (!(currentUser._id.equals(order.customerId))) {
      return responseUtils.badRequest(response, "Cannot delete your own data");
    }
    if (!order) {
      return responseUtils.notFound(response);
    }

    return responseUtils.sendJson(response, order);
};

const registerOrder = async (response, orderData) => {
    if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
      return responseUtils.badRequest(response, "Incomplete order data");
    }

    const newOrder = new Order(orderData);
    await newOrder.save();
    return responseUtils.sendJson(response, newOrder, 201);
};

module.exports = { getAllOrders, registerOrder, viewOrder };
