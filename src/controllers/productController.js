const productModel = require("../models/productModel");
const { isValidObjectId } = require("mongoose");
const uploadFile = require("../AWS/awsConfig");
const {
  validateName,
  validatePincode,
  validatePrice,
  ValidateStyle,
  ValidateFile,
  validateDescription,
} = require("../validation/validator");



//================================= Create Product ================================================//



let createProduct = async function (req, res) {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0) {
      return res.status(400).send({
        status: "false",
        message: "Please enter the data in request body",
      });
    }

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = data;

    if (!title || title == "") {
      return res.status(400).send({
        status: false,
        message: "Title is mandatory and title Should not be Empty",
      });
    }

    if (!validateName(title.trim())) {
      return res
        .status(400)
        .send({ status: false, message: " Invalid Title " });
    }
    const checkTitle = await productModel.findOne({ title });

    if (checkTitle) {
      return res.status(400).send({
        status: false,
        message: "This title already exist, provide a new title",
      });
    }

    if (!description || description == "") {
      return res.status(400).send({
        status: false,
        message: "Description is mandatory and description Should not be Empty",
      });
    }

    if (!validateDescription(description.trim())) {
      return res
        .status(400)
        .send({ status: false, message: " Invalid description " });
    }

    if (!price) {
      return res
        .status(400)
        .send({ status: false, message: "Price is mandatory " });
    }

    if (!validatePrice(price.trim())) {
      return res.status(400).send({
        status: false,
        message: "Price is not present in correct format",
      });
    }
    data.price = Number(price).toFixed(2);

    if (!currencyId) {
      return res
        .status(400)
        .send({ status: false, message: "Currency Id is mandatory " });
    }

    currencyId = currencyId.trim();
    if (currencyId != "INR") {
      return res.status(400).send({
        status: false,
        msg: " Please provide the currencyId as INR ",
      });
    }
    data.currencyId = currencyId;

    if (!currencyFormat) {
      return res
        .status(400)
        .send({ status: false, message: "Currency Format is mandatory " });
    }

    currencyFormat = currencyFormat.trim();
    if (currencyFormat != "₹") {
      return res.status(400).send({
        status: false,
        message: "Please provide the currencyformat as `₹` ",
      });
    }
    data.currencyFormat = currencyFormat;

    if (isFreeShipping) {
      isFreeShipping = isFreeShipping.trim();
      if (isFreeShipping !== "true" && isFreeShipping !== "false") {
        return res.status(400).send({
          status: false,
          message: "isFreeShipping should either be True, or False.",
        });
      }
    }
    data.isFreeShipping = isFreeShipping;

    let files = req.files;
    if (files && files.length > 0) {
      if (!ValidateFile(files[0].originalname))
        return res
          .status(400)
          .send({ status: false, message: `Enter format jpeg/jpg/png only.` });

      let uploadedFileURL = await uploadFile.uploadFile(files[0]);
      data.productImage = uploadedFileURL;
    } else {
      return res.status(400).send({ message: "Files are required " });
    }

    if (!ValidateStyle(style.trim())) {
      return res
        .status(400)
        .send({ status: false, message: "Style is not in correct format" });
    }

    const isValidateSize = function (value) {
      return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(value) !== -1;
    };

    if (availableSizes) {
      let validSize = availableSizes.trim();
      let size = validSize.toUpperCase().split(",");
      data.availableSizes = size;

      for (let i = 0; i < size.length; i++) {
        if (!isValidateSize(size[i])) {
          return res.status(400).send({
            status: false,
            message: `${size[i]} size is not available`,
          });
        }
      }
    }

    if (installments) {
      if (!installments && typeof installments.trim() !== Number) {
        return res.status(400).send({
          status: false,
          message: "Installments should be in correct format",
        });
      }
    }
    data.installments = installments;

    let savedProduct = await productModel.create(data);

    return res
      .status(201)
      .send({ status: true, message: "Success", data: savedProduct });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


//================================= Get Products ================================================//



const getProducts = async function (req, res) {
    try {
      let obj = req.query;
      let filter = { isDeleted: false };
      let { size, name, priceLessThan, priceGreaterThan, priceSort } = obj;
  
      if (Object.keys(obj).length === 0) {
        return res
          .status(400)
          .send({ status: false, message: "Please give some parameters." });
      }
  
      if (size) {
        size = size.toUpperCase().trim();
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) {
          return res
            .status(400)
            .send({ status: false, message: "Size is not valid" });
        }
        filter["availableSizes"] = { $in: size };
      }
  
      if (name) {
        filter["title"] = { $regex: name };
      }
  
      if (priceLessThan) {
        if (!validatePrice(priceLessThan)) {
          return res
            .status(400)
            .send({ status: false, message: "Price is not valid" });
        }
        filter["price"] = { $lt: priceLessThan };
      }
  
      if (priceGreaterThan) {
        if (!validatePrice(priceGreaterThan)) {
          return res
            .status(400)
            .send({ status: false, message: "Not a valid Price" });
        }
        filter["price"] = { $gt: priceGreaterThan };
      }
  
      if (priceSort) {
        if (!(priceSort == 1 || priceSort == -1)) {
          return res.status(400).send({
            status: false,
            message: "Price can be sorted with the value 1 or -1 only",
          });
        }
      }
  
      let productDetails = await productModel
        .find(filter)
        .sort({ price: priceSort });
  
      if (productDetails.length === 0) {
        return res.status(404).send({ status: false, message: "no data found" });
      }
  
      return res
        .status(200)
        .send({ status: true, message: "Success", data: productDetails });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  };
  
  

//================================= Get Products By Id ================================================//



const getProductById = async function (req, res) {
    try {
      let productId = req.params.productId;
  
      if (!isValidObjectId(productId))
        return res.status(404).send({
          status: false,
          message: `Please Enter Valid ProductId: ${productId}.`,
        });
  
      let getProduct = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
  
      if (!getProduct)
        return res.status(404).send({
          status: false,
          message: "Product data not found , it might be deleted.",
        });
  
      return res
        .status(200)
        .send({ status: true, message: "Success", data: getProduct });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
  
  
  
