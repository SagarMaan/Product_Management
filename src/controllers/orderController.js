const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const { isValidObjectId } = require("mongoose");
const { ValidateStatus } = require("../validation/validator");




//================================= Create Order ================================================//



const createOrder = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    let { cartId, cancellable } = data;

    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid User Id" });

    let userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).send({ status: false, message: "User Not Found" });
    }
    if (cancellable) {
      if (cancellable !== "true" && cancellable !== "false") {
        return res
          .status(400)
          .send({
            status: false,
            message: "cancellable data always either true or false",
          });
      }
    }
    if (!cancellable) {
      cancellable = false;
    }

    if (!cartId)
      return res.status(400).send({ status: false, message: "Enter cartId" });

    const cart = await cartModel.findById(cartId);

    if (!cart)
      return res.status(404).send({ status: false, message: "Cart Not Found" });

    if (req.token.userId != cart.userId.toString())
      return res
        .status(403)
        .send({ status: false, message: "Unauthorised User" });

    let { items, totalPrice, totalItems } = cart;

    if (items.length == 0)
      return res.status(404).send({
        status: false,
        message: "Cart is empty. Please add Product to Cart.",
      });

    let totalQuantity = 0;

    for (let i = 0; i < items.length; i++) {
      totalQuantity += items[i].quantity;
    }
    data.userId = userId;
    data.items = items;
    data.totalPrice = totalPrice;
    data.totalItems = totalItems;
    data.totalQuantity = totalQuantity;

    let order = await orderModel.create(data);

    if (order) {
      let cartUpdate = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { totalPrice: 0, totalItems: 0, items: [] },
        { new: true }
      );
    }
    return res
      .status(200)
      .send({ status: true, message: "Success", data: order });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


