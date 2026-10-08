import { useState } from "react";
import type { Screen } from "./components/erp/types";
import Header from "./components/erp/Header";
import Sidebar from "./components/erp/Sidebar";
import { RequestModal } from "./components/erp/RequestModal";
import UsersScreen from "./components/erp/screens/UsersScreen";
import RolesScreen from "./components/erp/screens/RolesScreen";
import RoleCategoriesScreen from "./components/erp/screens/RoleCategoriesScreen";
import CreateRoleCategoryScreen from "./components/erp/screens/CreateRoleCategoryScreen";
import RoleCategoryDetailScreen from "./components/erp/screens/RoleCategoryDetailScreen";
import NewRoleScreen from "./components/erp/screens/NewRoleScreen";
import MyRoleRequestsScreen from "./components/erp/screens/MyRoleRequestsScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("users");
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="zf-app-shell flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header onNavigate={setScreen} onOpenRequestAccess={() => setShowRequestModal(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar current={screen} onNavigate={setScreen} />
        <main className="flex-1 flex overflow-hidden">
          {screen === "users"                && <UsersScreen onNavigate={setScreen} />}
          {screen === "roles"                && <RolesScreen onNavigate={setScreen} />}
          {screen === "role-categories"      && <RoleCategoriesScreen onNavigate={setScreen} />}
          {screen === "create-role-category" && <CreateRoleCategoryScreen onNavigate={setScreen} />}
          {screen === "role-category-detail" && <RoleCategoryDetailScreen onNavigate={setScreen} />}
          {screen === "new-role"             && <NewRoleScreen onNavigate={setScreen} />}
          {screen === "my-role-requests"     && (
            <MyRoleRequestsScreen
              onNavigate={setScreen}
              onOpenRequestAccess={() => setShowRequestModal(true)}
            />
          )}
        </main>
      </div>
      {showRequestModal && (
        <RequestModal
          onClose={() => setShowRequestModal(false)}
          onSubmitted={() => {
            setShowRequestModal(false);
            setScreen("my-role-requests");
          }}
        />
      )}
    </div>
  );
}
