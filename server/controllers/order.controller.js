import Order from "../models/order.model.js";

export const getOrders = async (req, res) => {
    try {
        const {
            search,
            productId,
            type,
            minQuantity,
            maxQuantity,
            minDiscount,
            maxDiscount,
            startDate,
            endDate
        } = req.query;

        // Build filter conditions
        const filter = {};

        // Product ID exact match
        if (productId && productId !== '') {
            filter.productId = productId;
        }

        // Order type exact match
        if (type && type !== '') {
            filter.type = type;
        }

        // Quantity range
        const hasMinQty = minQuantity !== undefined && minQuantity !== '';
        const hasMaxQty = maxQuantity !== undefined && maxQuantity !== '';
        if (hasMinQty || hasMaxQty) {
            filter.quantity = {};
            if (hasMinQty) filter.quantity.$gte = Number(minQuantity);
            if (hasMaxQty) filter.quantity.$lte = Number(maxQuantity);
        }

        // Discount range
        const hasMinDisc = minDiscount !== undefined && minDiscount !== '';
        const hasMaxDisc = maxDiscount !== undefined && maxDiscount !== '';
        if (hasMinDisc || hasMaxDisc) {
            filter.discount = {};
            if (hasMinDisc) filter.discount.$gte = Number(minDiscount);
            if (hasMaxDisc) filter.discount.$lte = Number(maxDiscount);
        }

        // Date range
        const hasStart = startDate && startDate !== '';
        const hasEnd = endDate && endDate !== '';
        if (hasStart || hasEnd) {
            filter.createdAt = {};
            if (hasStart) filter.createdAt.$gte = new Date(startDate);
            if (hasEnd) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        // Search by product name (requires populate)
        let searchQuery = Order.find(filter);

        if (search && search.trim() !== '') {
            // We'll match the search after populating product
            searchQuery = searchQuery.populate({
                path: 'productId',
                match: {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { companyName: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        } else {
            searchQuery = searchQuery.populate('productId');
        }

        const orders = await searchQuery.exec();

        // Post-process to handle search across populated fields
        const filteredOrders = search
            ? orders.filter(order => order.productId) // Only keep orders where product matches search
            : orders;

        return res.status(200).json({ success: true, data: filteredOrders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('productId');
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { productId, discount, quantity, type } = req.body;
        if (!productId || quantity == null || !type) {
            return res.status(400).json({ success: false, message: "Product ID, quantity, and type are required" });
        }

        const newOrder = new Order({
            productId,
            discount,
            quantity,
            type
        });
        const savedOrder = await newOrder.save();
        return res.status(201).json({ success: true, data: savedOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};