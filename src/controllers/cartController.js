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



//================================= Get Cart ================================================//



const getCart = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      if (userId) {
        if (!isValidObjectId(userId))
          return res
            .status(400)
            .send({ status: false, message: "Please provide correct UserId." });
      }
  
      let checkUserId = await userModel.findById(userId);
  
      if (!checkUserId) {
        return res
          .status(404)
          .send({ status: false, message: "No user found with this userId." });
      }
  
      let getCartData = await cartModel.findOne({ userId: userId });
  
      if (!getCartData) {
        return res
          .status(404)
          .send({ status: false, message: "Cart not found with this userId." });
      }
  
      if (getCartData.items.length == 0) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Items details not found or it may be deleted.",
          });
      }
  
      return res
        .status(200)
        .send({ status: true, message: "Success", data: getCartData });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
  
  
  
//================================= Update Cart ================================================//


const updateCart = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      if (!isValidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid user id." });
      }
  
      let checkUserId = await userModel.findById(userId);
  
      if (!checkUserId) {
        return res
          .status(404)
          .send({
            status: false,
            message:
              "This userID does not exsit in your database , check your userId.",
          });
      }
  
      let body = req.body;
      let { cartId, productId, removeProduct } = body;
  
      if (Object.keys(body).length == 0) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "You can not update empty body,please provide required credentials.",
          });
      }
  
      if (!cartId) {
        return res
          .status(400)
          .sedn({ status: false, message: "Please provide cartId." });
      }
  
      if (!isValidObjectId(cartId)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid cart id." });
      }
  
      let checkCartId = await cartModel.findById(cartId);
  
      if (!checkCartId) {
        return res
          .status(404)
          .send({
            status: false,
            message:
              "This cartID does not exsit in your database , check your cartId.",
          });
      }
  
      if (checkCartId.userId != userId) {
        return res
          .status(401)
          .send({
            status: false,
            message: "This is not your cartId enter your own cart Id.",
          });
      }
  
      if (checkCartId.items.length == 0) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "There are no items left in this cart or it might be deleted.",
          });
      }
  
      if (!productId) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide productId" });
      }
  
      if (!isValidObjectId(productId)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid product id." });
      }
  
      let checkProductId = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
  
      if (!checkProductId) {
        return res
          .status(404)
          .send({
            status: false,
            message:
              "This productID does not exsit in your database , it might be deleted.",
          });
      }
  
      if (!removeProduct) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Please provide remove product data.",
          });
      }
  
      if (removeProduct != 0 && removeProduct != 1) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "Enter 0 for remove Product or 1 for decrement Product quantity.",
          });
      }
  
      for (i = 0; i < checkCartId.items.length; i++) {
        if (checkCartId.items[i].productId == productId) {
          if (removeProduct == 1 && checkCartId.items[i].quantity > 1) {
            checkCartId.items[i].quantity = checkCartId.items[i].quantity - 1;
            checkCartId.totalPrice =
              checkCartId.totalPrice -
              checkCartId.items[i].quantity * checkProductId.price;
  
            checkCartId.save();
  
            return res
              .status(200)
              .send({ status: true, message: " Success ", data: checkCartId });
          }
  
          if (removeProduct == 1 && checkCartId.items[i].quantity == 1) {
            let newItems = {
              productId: checkCartId.items[i].productId,
              quantity: checkCartId.items[i].quantity,
            };
            let totalPrice =
              checkCartId.totalPrice -
              checkCartId.items[i].quantity * checkProductId.price;
  
            let updatedCart = await cartModel.findOneAndUpdate(
              { _id: cartId },
              {
                $pull: { items: newItems },
                totalPrice: totalPrice,
                $inc: { totalItems: -1 },
              },
              { new: true }
            );
  
            return res
              .status(200)
              .send({ status: true, message: true, data: updatedCart });
          }
  
          if (removeProduct == 0 && checkCartId.items[i].quantity >= 1) {
            let newItems = {
              productId: checkCartId.items[i].productId,
              quantity: checkCartId.items[i].quantity,
            };
            let totalPrice =
              checkCartId.totalPrice -
              checkCartId.items[i].quantity * checkProductId.price;
  
            let updatedCart = await cartModel.findOneAndUpdate(
              { _id: cartId },
              {
                $pull: { items: newItems },
                totalPrice: totalPrice,
                $inc: { totalItems: -1 },
              },
              { new: true }
            );
  
            return res
              .status(200)
              .send({ status: true, message: true, data: updatedCart });
          }
        }
      }
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
  
  
//================================= Delete Cart ================================================//


const deleteCart = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      if (!isValidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid userId. " });
      }
  
      let cartDeleted = await cartModel.findOneAndUpdate(
        { userId: userId },
        { $set: { items: [], totalPrice: 0, totalItem: 0 } },
        { new: true }
      );
  
      if (!cartDeleted) {
        return res
          .status(404)
          .send({
            status: false,
            message: "Cart does not exit in with this userId.",
          });
      }
  
      return res
        .status(204)
        .send({ status: true, message: "Cart succesully deleted." });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
  
  
  module.exports = { createCart, getCart, updateCart, deleteCart };
  