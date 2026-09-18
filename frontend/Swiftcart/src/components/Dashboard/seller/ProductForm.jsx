import { useEffect, useState } from "react";
import api from "../../services/productapi";

const empty = {
  name: "",
  brand: "",
  category: "",
  stock: 30,
  package_quantity: "",
  package_unit: "g",
  price_inr: "",
  offer: 17,
  image: null,
};

export default function ProductForm({
  editProduct,
  refresh,
  clearEdit,
}) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    loadCategory();
  }, []);

  useEffect(() => {
    if (editProduct) {
      setForm({
        ...editProduct,
        image: null,
      });
    } else {
      setForm(empty);
    }
  }, [editProduct]);

  const loadCategory = async () => {
    const res = await api.get("categories/");
    setCategories(res.data);
  };

  const change = (e) => {
    const { name, value, files } = e.target;

    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach((k) => {
      if (form[k] !== null) data.append(k, form[k]);
    });

    if (editProduct) {
      await api.patch(`products/management/${editProduct.uuid}/`, data);
    } else {
      await api.post("products/management/", data);
    }

    refresh();
    clearEdit();
    setForm(empty);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-bold mb-5">
        {editProduct ? "Update Product" : "Create Product"}
      </h2>

      <form onSubmit={submit} className="space-y-4">

        <input
          name="name"
          value={form.name}
          onChange={change}
          placeholder="Product Name"
          className="input"
        />

        <input
          name="brand"
          value={form.brand}
          onChange={change}
          placeholder="Brand"
          className="input"
        />

        <select
          name="category"
          value={form.category}
          onChange={change}
          className="input"
        >
          <option>Select Category</option>

          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

        </select>

        <div className="grid grid-cols-2 gap-3">

          <input
            type="number"
            name="price_inr"
            value={form.price_inr}
            onChange={change}
            placeholder="Price"
            className="input"
          />

          <input
            type="number"
            name="offer"
            value={form.offer}
            onChange={change}
            placeholder="Offer %"
            className="input"
          />

        </div>

        <div className="grid grid-cols-2 gap-3">

          <input
            type="number"
            name="package_quantity"
            value={form.package_quantity}
            onChange={change}
            placeholder="Quantity"
            className="input"
          />

          <select
            name="package_unit"
            value={form.package_unit}
            onChange={change}
            className="input"
          >
            <option>g</option>
            <option>kg</option>
            <option>ml</option>
            <option>L</option>
            <option>pcs</option>
          </select>

        </div>

        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={change}
          placeholder="Stock"
          className="input"
        />

        <input
          type="file"
          name="image"
          onChange={change}
          className="w-full border p-2 rounded-lg"
        />

        <button className="w-full bg-black text-white py-3 rounded-xl">
          {editProduct ? "Update" : "Create"}
        </button>

      </form>

    </div>
  );
}