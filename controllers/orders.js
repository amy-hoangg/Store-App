const Order = require('../models/order');
const responseUtils = require('../utils/responseUtils');

const getAllOrders = async (response) => {
  try {
    const orders = await Order.find({});
    return responseUtils.sendJson(response, orders);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

const deleteOrder = async (response, orderId, currentOrder) => {
  try {
    const order = await Order.findById(orderId).exec();

    if (currentOrder._id.equals(orderId)) {
      return responseUtils.badRequest(response, "Cannot delete your own data");
    }
    if (!order) {
      return responseUtils.notFound(response);
    }

    const orderToDelete = await Order.findByIdAndDelete(orderId);
    return responseUtils.sendJson(response, orderToDelete);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

const updateOrder = async (response, orderId, currentOrder, orderData) => {
  try {
    const order = await Order.findById(orderId).exec();

    if (!order) {
      return responseUtils.notFound(response);
    }

    if (currentOrder._id.equals(orderId)) {
      return responseUtils.badRequest(response, "Updating own data is not allowed");
    }

    if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
      return responseUtils.badRequest(response, "Incomplete order data");
    }

    // Update the order fields
    order.customerId = orderData.customerId;
    order.items = orderData.items;

    await order.save();
    return responseUtils.sendJson(response, order);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

const viewOrder = async (response, orderId, currentOrder) => {
  try {
    const order = await Order.findById(orderId).exec();

    if (!order) {
      return responseUtils.notFound(response);
    }

    return responseUtils.sendJson(response, order);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

const registerOrder = async (response, orderData) => {
  try {
    if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
      return responseUtils.badRequest(response, "Incomplete order data");
    }

    const newOrder = new Order(orderData);
    await newOrder.save();
    return responseUtils.sendJson(response, newOrder, 201);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

module.exports = { getAllOrders, registerOrder, deleteOrder, viewOrder, updateOrder };
