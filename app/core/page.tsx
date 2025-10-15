export default function CoreDashboard() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold text-slate-700">Estado del Sistema</h2>
        <p className="text-slate-500 mt-2">Todos los servicios operativos.</p>
      </div>

      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold text-slate-700">Marcas registradas</h2>
        <p className="text-slate-500 mt-2">3 activas, 1 pendiente.</p>
      </div>

      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold text-slate-700">Entornos conectados</h2>
        <p className="text-slate-500 mt-2">Admin / Agency / Traveler</p>
      </div>
    </section>
  );
}
