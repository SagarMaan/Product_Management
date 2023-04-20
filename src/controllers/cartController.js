const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const { isValidObjectId } = require("mongoose");



//================================= Create Cart ================================================//



const createCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "UserId is invalid , please provide valid userId.",
        });
    }

    let checkUserId = await userModel.findById(userId);

    if (!checkUserId) {
      return res
        .status(404)
        .send({
          status: false,
          message: " This user is not exsit or it might be deleted.",
        });
    }

    let data = req.body;
    let { productId, quantity, cartId } = data;

    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "You can not create cart with empty body,please provide required credentals.",
        });
    }

    if (!productId) {
      return res
        .status(400)
        .send({ status: false, message: " Please provide productId." });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide a Valid product Id." });
    }

    let checkProductExist = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!checkProductExist) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Product does not  Exists of this Id.",
        });
    }

    if (!quantity) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Please enter some quantity of the products.",
        });
    }

    let checkUserExist = await cartModel.findOne({ userId: userId });

    if (!checkUserExist) {
      let addNewCart = {
        userId: userId,
        items: [
          {
            productId: productId,
            quantity: quantity,
          },
        ],
        totalItems: 1,
        totalPrice: checkProductExist.price * quantity,
      };

      let createCart = await cartModel.create(addNewCart);

      return res
        .status(201)
        .send({ status: true, message: "Success", data: createCart });
    } else {
      if (!cartId) {
        return res
          .status(400)
          .send({ status: false, message: " Please provide CartId." });
      }

      if (!isValidObjectId(cartId)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide a Valid CartId" });
      }

      let checkCartExist = await cartModel.findById(cartId);

      if (!checkCartExist) {
        return res
          .status(404)
          .send({
            status: false,
            message: "Cart is not found with this CartId",
          });
      }
      if (cartId != checkUserExist._id) {
        return res
          .status(401)
          .send({
            status: false,
            message: " This cart does not belong to that user.",
          });
      }

      for (i = 0; i < checkCartExist.items.length; i++) {
        if (checkCartExist.items[i].productId == productId) {
          checkCartExist.items[i].quantity =
            checkCartExist.items[i].quantity + parseInt(quantity);

          checkCartExist.totalPrice =
            checkCartExist.totalPrice + quantity * checkProductExist.price;

          checkCartExist.save();

          return res
            .status(201)
            .send({ status: true, message: "Success", data: checkCartExist });
        }
      }

      if (checkCartExist.items.productId != productId) {
        let items = { productId: productId, quantity: quantity };

        let totalPrice =
          checkCartExist.totalPrice + quantity * checkProductExist.price;

        let updateCartItems = await cartModel.findOneAndUpdate(
          { _id: cartId },
          {
            $set: { totalPrice: totalPrice },
            $push: { items: items },
            $inc: { totalItems: 1 },
          },
          { new: true }
        );

        return res
          .status(201)
          .send({ status: true, message: "Success", data: updateCartItems });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


