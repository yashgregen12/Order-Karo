import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    hsnCode: {
        type: String,
        required: true,
        trim: true,
    },
    gstRate: {
        type: Number,
        enum: [12, 18],
        required: true,
    },
    unit: {
        type: String,
        required: true,
        enum: ["Pcs.", "CB", "Kg", "Ream", "Pkt.", "Tube"]
    },
}, {
    timestamps: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;