import React, { useEffect, useState, useCallback } from "react";
import {
  fetchProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../lib/api";
import Card from "../components/Card";
import Field from "../components/Field";
import Select from "../components/Select";
import Button from "../components/Button";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import {
  EditIcon,
  DeleteIcon,
} from "../components/Icons";

const INITIAL_FORM = {
  companyName: "",
  name: "",
  price: 0,
  stock: 0,
  hsnCode: "",
  gstRate: 18,
  unit: "Pcs.",
};

export default function ProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
  });

  const [filterValues, setFilterValues] = useState({
    search: "",
    companyName: "",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: "",
    gstRate: "",
    unit: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    companyName: [],
  });

  const loadProducts = useCallback(
    async (currentValues = filterValues) => {
      setLoading(true);
      try {
        // Clean filters for API
        const params = Object.fromEntries(
          Object.entries(currentValues).filter(
            ([_, v]) => v != null && v !== ""
          )
        );

        const res = await fetchProducts(params);
        const data = res.data.data || [];
        setProducts(data);

        // Update dynamic options without triggering a re-fetch
        const companies = [...new Set(data.map((p) => p.companyName))].map(
          (name) => ({ value: name, label: name })
        );
        setFilterOptions({ companyName: companies });
      } catch (e) {
        addToast(
          e.response?.data?.message || "Failed to load products",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [filterValues, addToast]
  );

  useEffect(() => {
    loadProducts();
  }, [filterValues]);

  // Transform for FilterBar
  const filtersForBar = {
    search: filterValues.search,
    companyName: {
      value: filterValues.companyName,
      type: "select",
      label: "Company",
      options: filterOptions.companyName,
    },
    price: {
      min: filterValues.minPrice,
      max: filterValues.maxPrice,
      type: "range",
      label: "Price Range",
      minPlaceholder: "Min Price",
      maxPlaceholder: "Max Price",
    },
    stock: {
      min: filterValues.minStock,
      max: filterValues.maxStock,
      type: "range",
      label: "Stock Range",
      minPlaceholder: "Min Stock",
      maxPlaceholder: "Max Stock",
    },
    gstRate: {
      value: filterValues.gstRate,
      type: "select",
      label: "GST Rate",
      options: [
        { value: "12", label: "12%" },
        { value: "18", label: "18%" },
      ],
    },
    unit: {
      value: filterValues.unit,
      type: "select",
      label: "Unit",
      options: [
        { value: "Pcs.", label: "Pcs." },
        { value: "CB", label: "CB" },
        { value: "Kg", label: "Kg" },
        { value: "Ream", label: "Ream" },
        { value: "Pkt.", label: "Pkt." },
        { value: "Tube", label: "Tube" },
      ],
    },
  };

  const handleFilterChange = (newFilters) => {
    setFilterValues({
      search:
        typeof newFilters.search === "string"
          ? newFilters.search
          : newFilters.search?.value || "",
      companyName: newFilters.companyName?.value || "",
      minPrice: newFilters.price?.min || "",
      maxPrice: newFilters.price?.max || "",
      minStock: newFilters.stock?.min || "",
      maxStock: newFilters.stock?.max || "",
      gstRate: newFilters.gstRate?.value || "",
      unit: newFilters.unit?.value || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingId) {
        await updateProduct(editingId, form);
        addToast("Product updated successfully", "success");
      } else {
        await createProduct(form);
        addToast("Product created successfully", "success");
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to save product",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({ ...product });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deleteModal.productId) return;
    setActionLoading(true);
    try {
      await deleteProduct(deleteModal.productId);
      addToast("Product deleted successfully", "success");
      if (editingId === deleteModal.productId) {
        setEditingId(null);
        setForm(INITIAL_FORM);
      }
      setDeleteModal({ isOpen: false, productId: null });
      loadProducts();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to delete product",
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
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Products
          </h2>
          <p className="text-gray-500 mt-1">
            Manage your inventory and stock levels
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
          {products.length} Products
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <Card
            title={editingId ? "Edit Product" : "New Product"}
            subtitle={
              editingId
                ? "Update existing product details"
                : "Add a new item to your catalog"
            }
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Company Name">
                <input
                  className="w-full h-11 bg-gray-50 border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  placeholder="e.g. Acme Corp"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Product Name">
                <input
                  className="w-full h-11 bg-gray-50 border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  placeholder="e.g. Wireless Mouse"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₹)">
                  <input
                    type="number"
                    className="w-full h-11 bg-gray-50 border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    className="w-full h-11 bg-gray-50 border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="GST Rate (%)">
                  <Select
                    value={form.gstRate}
                    onChange={(e) =>
                      setForm({ ...form, gstRate: Number(e.target.value) })
                    }
                    className="h-11"
                  >
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                  </Select>
                </Field>
                <Field label="Unit">
                  <Select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="h-11"
                  >
                    <option>Pcs.</option>
                    <option>CB</option>
                    <option>Kg</option>
                    <option>Ream</option>
                    <option>Pkt.</option>
                    <option>Tube</option>
                  </Select>
                </Field>
              </div>

              <Field label="HSN Code">
                <input
                  className="w-full h-11 bg-gray-50 border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  placeholder="8-digit code"
                  value={form.hsnCode}
                  onChange={(e) =>
                    setForm({ ...form, hsnCode: e.target.value })
                  }
                  required
                />
              </Field>

              <div className="pt-2 flex flex-col gap-3">
                <Button
                  type="submit"
                  loading={actionLoading}
                  className="w-full"
                >
                  {editingId ? "Update Product" : "Save Product"}
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
                  className="h-24 bg-white/50 animate-pulse rounded-xl border border-gray-100"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold">No products found</h3>
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your filters or add a new product.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {products.map((p) => (
                <Card
                  key={p._id}
                  className="group hover:scale-[1.01] transition-transform duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">
                          {p.name}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                          HSN: {p.hsnCode}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {p.companyName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-indigo-600">
                        ₹{p.price}
                      </div>
                      <div className="text-xs text-gray-400 font-medium">
                        {p.unit}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        Stock
                      </div>
                      <div
                        className={`font-semibold ${
                          p.stock < 10 ? "text-red-500" : "text-gray-700"
                        }`}
                      >
                        {p.stock} units
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        GST Rate
                      </div>
                      <div className="font-semibold text-gray-700">
                        {p.gstRate}%
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(p)}
                        className="text-indigo-600"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteModal({ isOpen: true, productId: p._id })
                        }
                        className="text-red-500"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </Button>
                    </div>
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
