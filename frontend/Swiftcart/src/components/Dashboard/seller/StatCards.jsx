export default function StatCards({ products }) {
  const total = products.length;
  const stock = products.filter((p) => p.stock > 0).length;
  const out = products.filter((p) => p.stock === 0).length;

  return (
    <div className="grid md:grid-cols-3 gap-5">

      <Card title="Total Products" value={total}/>

      <Card title="In Stock" value={stock}/>

      <Card title="Out of Stock" value={out}/>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">

      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className="text-3xl font-bold mt-2">{value}</h2>

    </div>
  );
}