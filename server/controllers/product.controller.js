import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        const { search, companyName, minPrice, maxPrice, minStock, maxStock, gstRate, unit } = req.query;

        // Build filter conditions
        const filter = {};

        // Text search across name, company name, and HSN code
        if (search && search.trim() !== '') {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { hsnCode: { $regex: search, $options: 'i' } }
            ];
        }

        // Company name exact match
        if (companyName && companyName.trim() !== '') {
            filter.companyName = { $regex: companyName, $options: 'i' };
        }

        // Price range
        const hasMinPrice = minPrice !== undefined && minPrice !== '';
        const hasMaxPrice = maxPrice !== undefined && maxPrice !== '';
        if (hasMinPrice || hasMaxPrice) {
            filter.price = {};
            if (hasMinPrice) filter.price.$gte = Number(minPrice);
            if (hasMaxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Stock range
        const hasMinStock = minStock !== undefined && minStock !== '';
        const hasMaxStock = maxStock !== undefined && maxStock !== '';
        if (hasMinStock || hasMaxStock) {
            filter.stock = {};
            if (hasMinStock) filter.stock.$gte = Number(minStock);
            if (hasMaxStock) filter.stock.$lte = Number(maxStock);
        }

        // GST rate exact match
        if (gstRate && gstRate !== '') {
            filter.gstRate = Number(gstRate);
        }

        // Unit exact match
        if (unit && unit !== '') {
            filter.unit = unit;
        }

        const products = await Product.find(filter);
        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const createProduct = async (req, res) => {
    try {

        const { companyName, name, price, stock, hsnCode, gstRate, unit } = req.body;

        if (!companyName || !name || price == null || stock == null || !hsnCode || gstRate == null || !unit) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newProduct = new Product({
            companyName,
            name,
            price,
            stock,
            hsnCode,
            gstRate,
            unit
        });
        const savedProduct = await newProduct.save();
        return res.status(201).json({ success: true, data: savedProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
