export default function BrandsPage() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Marcas</h2>
      <table className="w-full text-sm text-left">
        <thead className="border-b font-medium text-slate-600">
          <tr>
            <th className="py-2">Nombre</th>
            <th>Dominio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-slate-50">
            <td className="py-2">IVI Spain</td>
            <td>ivi.es</td>
            <td className="text-green-600 font-medium">Activo</td>
          </tr>
          <tr className="border-b hover:bg-slate-50">
            <td>Waiki Perú</td>
            <td>waiki.pe</td>
            <td className="text-yellow-600 font-medium">Pendiente</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
