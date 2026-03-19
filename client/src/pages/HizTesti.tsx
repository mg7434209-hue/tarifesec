import { Zap } from "lucide-react";

export default function HizTesti() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <div className="w-14 h-14 bg-[#e0f7fa] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Zap className="w-7 h-7 text-[#0097a7]" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">İnternet Hız Testi</h1>
      <p className="text-gray-500 mb-8">Bağlantı hızınızı ölçün</p>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <iframe
          src="https://fast.com"
          title="Hız Testi"
          className="w-full h-[500px] border-0"
        />
      </div>
      <p className="text-xs text-gray-400 mt-4">Fast.com (Netflix) tarafından sağlanmaktadır. Bağlantı kalitesi ağ koşullarına bağlı olarak değişebilir.</p>
    </div>
  );
}
