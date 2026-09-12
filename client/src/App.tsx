import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import Layout from "./components/Layout";
import Home from "./pages/Home";

/**
 * Ana sayfa doğrudan paketlenir (LCP); diğer rotalar ayrı parçalara bölünür.
 * Sunucu zaten tam içeriği bastığı için yükleme anında sayfa boş kalmaz.
 */
const PaketKarsilastirma = lazy(() => import("./pages/PaketKarsilastirma"));
const MobilTarifeler = lazy(() => import("./pages/MobilTarifeler"));
const HizTesti = lazy(() => import("./pages/HizTesti"));
const BlogListesi = lazy(() => import("./pages/Blog").then((m) => ({ default: m.BlogListesi })));
const BlogYazisi = lazy(() => import("./pages/Blog").then((m) => ({ default: m.BlogYazisi })));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Yukleniyor() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-sm text-gray-400" role="status">
      Yükleniyor…
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Yukleniyor />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/paket-karsilastir" component={PaketKarsilastirma} />
          <Route path="/mobil-tarifeler" component={MobilTarifeler} />
          <Route path="/hiz-testi" component={HizTesti} />
          <Route path="/blog" component={BlogListesi} />
          <Route path="/blog/:slug" component={BlogYazisi} />
          {/* Menüde yok, robots engelli, sitemap dışı */}
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}
