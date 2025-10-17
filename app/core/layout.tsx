import "../globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}