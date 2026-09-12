import { Route, Switch } from "wouter";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PaketKarsilastirma from "./pages/PaketKarsilastirma";
import MobilTarifeler from "./pages/MobilTarifeler";
import HizTesti from "./pages/HizTesti";
import { BlogListesi, BlogYazisi } from "./pages/Blog";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/paket-karsilastir" component={PaketKarsilastirma} />
        <Route path="/mobil-tarifeler" component={MobilTarifeler} />
        <Route path="/hiz-testi" component={HizTesti} />
        <Route path="/blog" component={BlogListesi} />
        <Route path="/blog/:slug" component={BlogYazisi} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}
