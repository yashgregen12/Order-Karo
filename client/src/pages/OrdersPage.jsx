import React, { useEffect, useState, useCallback } from "react";
import {
  fetchOrders,
  createOrder,
  fetchProducts,
  deleteOrder,
  updateOrder,
} from "../lib/api";
import Card from "../components/Card";
import Field from "../components/Field";
import Select from "../components/Select";
import Button from "../components/Button";
import Badge from "../components/Badge";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import {
  EditIcon,
  DeleteIcon,
} from "../components/Icons";

const INITIAL_FORM = {
  productId: "",
  quantity: 1,
  discount: 0,
  type: "Purchase",
};

export default function OrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
  });
  const [filterValues, setFilterValues] = useState({
    search: "",
    type: "",
    minQuantity: "",
    maxQuantity: "",
    startDate: "",
    endDate: "",
  });

  const loadData = useCallback(
    async (currentValues = filterValues) => {
      setLoading(true);
      try {
        // Clean filters for API
        const params = Object.fromEntries(
          Object.entries(currentValues).filter(
            ([_, v]) => v != null && v !== ""
          )
        );

        const [orRes, pRes] = await Promise.all([
          fetchOrders(params),
          fetchProducts(),
        ]);

        setOrders(orRes.data.data || []);
        setProducts(pRes.data.data || []);
      } catch (e) {
        addToast(e.response?.data?.message || "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    },
    [filterValues, addToast]
  );

  useEffect(() => {
    loadData();
  }, [filterValues]);

  // Transform for FilterBar
  const filtersForBar = {
    search: filterValues.search,
    type: {
      value: filterValues.type,
      type: "select",
      label: "Order Type",
      options: [
        { value: "Purchase", label: "Purchase" },
        { value: "Sale", label: "Sale" },
      ],
    },
    quantity: {
      min: filterValues.minQuantity,
      max: filterValues.maxQuantity,
      type: "range",
      label: "Quantity",
    },
    date: {
      start: filterValues.startDate,
      end: filterValues.endDate,
      type: "daterange",
      label: "Date Range",
    },
  };

  const handleFilterChange = (newFilters) => {
    setFilterValues({
      search:
        typeof newFilters.search === "string"
          ? newFilters.search
          : newFilters.search?.value || "",
      type: newFilters.type?.value || "",
      minQuantity: newFilters.quantity?.min || "",
      maxQuantity: newFilters.quantity?.max || "",
      startDate: newFilters.date?.start || "",
      endDate: newFilters.date?.end || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId) {
      addToast("Please select a product", "error");
      return;
    }

    setActionLoading(true);
    try {
      if (editingId) {
        await updateOrder(editingId, form);
        addToast("Order updated successfully", "success");
      } else {
        await createOrder(form);
        addToast("Order created successfully", "success");
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save order", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (order) => {
    setForm({
      productId: order.productId?._id || order.productId,
      quantity: order.quantity ?? 1,
      discount: order.discount ?? 0,
      type: order.type || "Purchase",
    });
    setEditingId(order._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deleteModal.orderId) return;
    setActionLoading(true);
    try {
      await deleteOrder(deleteModal.orderId);
      addToast("Order deleted successfully", "success");
      if (editingId === deleteModal.orderId) {
        setEditingId(null);
        setForm(INITIAL_FORM);
      }
      setDeleteModal({ isOpen: false, orderId: null });
      loadData();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to delete order",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, orderId: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete Order"
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Orders
          </h2>
          <p className="text-gray-500 mt-1">
            Track your product purchases and sales
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
          {orders.length} Entries
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <Card
            title={editingId ? "Edit Order" : "New Order"}
            subtitle={
              editingId
                ? "Update transaction details"
                : "Record a new purchase or sale"
            }
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Select Product">
                <Select
                  value={form.productId}
                  onChange={(e) =>
                    setForm({ ...form, productId: e.target.value })
                  }
                  className="h-11"
                  required
                >
                  <option value="">Choose a product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.companyName})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Transaction Type">
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "Purchase" })}
                    className={`py-2 text-sm font-semibold rounded-md transition-all ${
                      form.type === "Purchase"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Purchase
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "Sale" })}
                    className={`py-2 text-sm font-semibold rounded-md transition-all ${
                      form.type === "Sale"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Sale
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Quantity">
                  <input
                    type="number"
                    min="1"
                    className="w-full h-11 bg-gray-50 border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
                <Field label="Discount (%)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full h-11 bg-gray-50 border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    value={form.discount}
                    onChange={(e) =>
                      setForm({ ...form, discount: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button
                  type="submit"
                  loading={actionLoading}
                  className={`w-full ${
                    form.type === "Sale"
                      ? "bg-green-600 hover:bg-green-700 ring-green-500"
                      : ""
                  }`}
                >
                  {editingId ? "Update Order" : `Record ${form.type}`}
                </Button>
                {editingId && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setForm(INITIAL_FORM);
                    }}
                    className="w-full"
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-6">
          <FilterBar
            filters={filtersForBar}
            onFilterChange={handleFilterChange}
          />

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white/50 animate-pulse rounded-xl border border-gray-100"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold">No orders found</h3>
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your filters or record a new transaction.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((o) => (
                <Card
                  key={o._id}
                  className="group hover:scale-[1.01] transition-transform duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div
                        className={`mt-1 p-2 rounded-lg ${
                          o.type === "Sale"
                            ? "bg-green-50 text-green-600"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {o.type === "Sale" ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {o.productId?.name || "Unknown Product"}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {o.productId?.companyName || "N/A"}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {new Date(o.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <Badge
                        variant={o.type === "Sale" ? "success" : "info"}
                        size="md"
                      >
                        {o.type}
                      </Badge>
                      <div className="text-sm font-semibold text-gray-700">
                        {o.quantity} units
                        {o.discount > 0 && (
                          <span className="ml-1 text-red-500 text-xs">
                            (-{o.discount}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(o)}
                      className="text-indigo-600"
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDeleteModal({ isOpen: true, orderId: o._id })
                      }
                      className="text-red-500"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
