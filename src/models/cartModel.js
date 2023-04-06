const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            required: true,
            ref: "User",
            unique: true,
            trim: true
        },
        items: [
            {
                productId: {
                    type: ObjectId,
                    required: true,
                    ref: "Product",
                    trim: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    trim: true,
                    minlength: 1
                },
                _id : false
            }],
        totalItems: {
            type: Number,
            required: true,
            trim: true
        },
        totalPrice: {
            type: Number,
            required: true,
        }
        
    },
    { timestamps: true }    
);

module.exports = mongoose.model("CartData", cartSchema);