import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    type: {
        type: String,
        required: true,
        enum: ["Purchase", "Sale"]
    },
}, {
    timestamps: true,
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
