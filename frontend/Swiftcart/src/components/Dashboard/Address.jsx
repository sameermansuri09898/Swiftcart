import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AddressCard from "./addcard"
import AddressForm from "../credential/addform";
import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  createAddress,
} from "../services/addservices";

export default function AddressSection() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getAddresses();
      const list = Array.isArray(data) ? data : data?.results || [];
      setAddresses([...list]);
    } catch (err) {
      console.error(err);
      setErrorMessage("Addresses load nahi ho paaye. Kripya login check karein.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap is address ko delete karna chahte hain?")) return;
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
      } else {
        await createAddress(formData);
      }
      setShowForm(false);
      setEditingAddress(null);
      await fetchAddresses();
    } catch (err) {
      console.error("Save Error:", err);
      setErrorMessage("Address save nahi ho paaya. Form check karein.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {editingAddress ? "Edit Delivery Address" : "Add New Address"}
            </h2>
            <button
              onClick={handleCancelForm}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              Cancel
            </button>
          </div>

          <AddressForm
            onSubmit={handleSave}
            initialData={editingAddress}
            onCancel={handleCancelForm}
          />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Addresses</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your order shipping locations.</p>
            </div>

            <button
              onClick={handleAdd}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <Plus size={16} /> Add New Address
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading addresses...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!Array.isArray(addresses) || addresses.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No saved addresses found.</p>
                  <p className="text-xs text-slate-400 mt-1">Click above to add a new shipping address.</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <AddressCard
                    key={address.id || Math.random()}
                    address={address}
                    onDelete={handleDelete}
                    onDefault={handleDefault}
                    onEdit={handleEdit}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}