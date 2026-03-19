import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Bu sayfa bulunamadı.</p>
      <Link href="/" className="bg-[#0097a7] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#00838f] transition-colors">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
