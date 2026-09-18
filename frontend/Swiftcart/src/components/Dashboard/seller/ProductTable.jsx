import api from "../../services/productapi";
import { Pencil, Trash2 } from "lucide-react";

export default function ProductTable({
  products,
  onEdit,
  refresh,
}) {

  const remove = async (id) => {
    if (!window.confirm("Delete Product?")) return;

    await api.delete(`products/management//${id}/`);
    refresh();
  };

  return (
    <div className="bg-white rounded-2xl shadow">

      <div className="p-5 border-b">

        <h2 className="text-xl font-bold">
          Product Inventory
        </h2>

      </div>

      <table className="w-full">

        <thead className="bg-gray-50">

          <tr>
            <th className="p-4">Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {products.map((p) => (

            <tr key={p.uuid} className="border-t">

              <td className="p-4 flex items-center gap-3">

                <img
                  src={p.small_image}
                  className="w-14 h-14 rounded-lg object-cover"
                />

                <div>

                  <p className="font-semibold">{p.name}</p>

                  <span className="text-sm text-gray-500">
                    {p.brand}
                  </span>

                </div>

              </td>

              <td>{p.category_name}</td>

              <td>₹{p.final_price}</td>

              <td>{p.stock}</td>

              <td>

                <div className="flex gap-3">

                  <button onClick={() => onEdit(p)}>
                    <Pencil size={18}/>
                  </button>

                  <button onClick={() => remove(p.uuid)}>
                    <Trash2 size={18}/>
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}