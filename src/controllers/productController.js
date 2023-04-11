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


