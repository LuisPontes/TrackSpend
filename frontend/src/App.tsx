import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { GruposPage } from "./pages/GruposPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DespesasPage } from "./pages/DespesasPage";
import { GraficosPage } from "./pages/GraficosPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/grupos" element={<GruposPage />} />
          <Route path="/grupos/:grupoId/dashboard" element={<DashboardPage />} />
          <Route path="/grupos/:grupoId/despesas" element={<DespesasPage />} />
          <Route path="/grupos/:grupoId/graficos" element={<GraficosPage />} />
          <Route path="/grupos/:grupoId/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/grupos" replace />} />
    </Routes>
  );
}

export default App;
