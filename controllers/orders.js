const Order = require('../models/order');
const responseUtils = require('../utils/responseUtils');

const getAllOrders = async (response) => {
    const orders = await Order.find({}).exec();
    return responseUtils.sendJson(response, orders);
};

const getUserOrders = async (response, currentUser) => {
  const orders = await Order.find({ customerId: currentUser._id }).exec();
  return responseUtils.sendJson(response, orders);
};

const viewOrder = async (response, id, currentUser) => {
  const order = await Order.findOne({_id : id});
  if (order === null) {
    return responseUtils.notFound(response);
  }

  switch (currentUser.role) {
    case 'admin': 
      return responseUtils.sendJson(response, order, 200);
    case 'customer':
      if (order.customerId.toString() !== currentUser._id.toString()) {
        return responseUtils.notFound(response);
      }
      return responseUtils.sendJson(response, order, 200);
  }
};


const registerOrder = async (response, currentUser, orderData) => {
  if (!orderData.customerId || !orderData.items || orderData.items.length === 0 || orderData.items === 'undefined') {
    return responseUtils.badRequest(response, "Incomplete order data");
  }

  try {
    const newOrder = new Order({...orderData, customerId : currentUser._id});
    await newOrder.save();
    return responseUtils.sendJson(response, newOrder, 201);
  } catch (error) {
    return responseUtils.badRequest(response, error);
  }
};
module.exports = { getAllOrders, getUserOrders, registerOrder, viewOrder };
