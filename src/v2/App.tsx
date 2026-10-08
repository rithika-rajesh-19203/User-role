import { useState } from "react";
import type { ReactNode } from "react";
import { SettingsBar, SettingsPage } from "@canon";
import type { SettingsLink } from "@canon";
import { BOOKS_MARK } from "./marks";
import { SETTINGS_SECTIONS } from "./data/settings";
import { ORG_NAME } from "./data/people";
import { FrameContext } from "./Frame";
import type { FrameChrome } from "./Frame";
import type { Screen, ScreenProps } from "./types";
import AccountActions from "./account/AccountActions";
import RequestRoleModal from "./account/RequestRoleModal";
import UsersScreen from "./screens/UsersScreen";
import RolesScreen from "./screens/RolesScreen";
import NewRoleScreen from "./screens/NewRoleScreen";
import RoleCategoriesScreen from "./screens/RoleCategoriesScreen";
import CreateRoleCategoryScreen from "./screens/CreateRoleCategoryScreen";
import RoleCategoryDetailScreen from "./screens/RoleCategoryDetailScreen";
import MyRoleRequestsScreen from "./screens/MyRoleRequestsScreen";

const SCREENS: Record<Screen, (props: ScreenProps) => ReactNode> = {
  users: UsersScreen,
  roles: RolesScreen,
  "new-role": NewRoleScreen,
  "role-categories": RoleCategoriesScreen,
  "create-role-category": CreateRoleCategoryScreen,
  "role-category-detail": RoleCategoryDetailScreen,
  "my-role-requests": MyRoleRequestsScreen,
};

/** Which rail leaf is lit for each screen — sub-pages light their parent, as in v1. */
const NAV_LEAF: Record<Screen, string> = {
  users: "users",
  "my-role-requests": "users",
  roles: "roles",
  "new-role": "roles",
  "role-categories": "role-categories",
  "create-role-category": "role-categories",
  "role-category-detail": "role-categories",
};

const LEAF_SCREEN: Record<string, Screen> = {
  users: "users",
  roles: "roles",
  "role-categories": "role-categories",
};

const TITLES: Record<Screen, string> = {
  users: "Users",
  roles: "Roles",
  "new-role": "New Role",
  "role-categories": "Role Categories",
  "create-role-category": "New Role Category",
  "role-category-detail": "Role Category",
  "my-role-requests": "My Role Requests",
};

/** Leaves outside the role access flow have no page in this prototype. */
function notBuilt(link: SettingsLink) {
  window.alert(`${link.label} is not part of this prototype.`);
}

/** `#roles`, `#my-role-requests`, … opens that screen directly; `#all` opens the directory. */
function screenFromHash(): Screen | null {
  const id = window.location.hash.slice(1);
  if (id === "all") return null;
  return id in TITLES ? (id as Screen) : "users";
}

export default function App() {
  //  null = the All Settings directory (level 0). v1 had no directory and
  //  opened straight on Users, so v2 does too.
  const [screen, setScreen] = useState<Screen | null>(screenFromHash);
  const [requestOpen, setRequestOpen] = useState(false);
  const [query, setQuery] = useState("");

  const actions = (
    <AccountActions
      onOpenMyRoleRequests={() => setScreen("my-role-requests")}
      onOpenRequestAccess={() => setRequestOpen(true)}
    />
  );

  const modal = (
    <RequestRoleModal
      open={requestOpen}
      onClose={() => setRequestOpen(false)}
      onSubmitted={() => {
        setRequestOpen(false);
        setScreen("my-role-requests");
      }}
    />
  );

  const openLeaf = (link: SettingsLink) => {
    const next = LEAF_SCREEN[link.id];
    if (next) setScreen(next);
    else notBuilt(link);
  };

  if (!screen) {
    return (
      <>
        <SettingsBar
          title="All Settings"
          mark={BOOKS_MARK}
          org={ORG_NAME}
          searchPlaceholder="Search Settings"
          onSearch={setQuery}
          onClose={() => setScreen("users")}
          actions={actions}
        >
          <SettingsPage sections={SETTINGS_SECTIONS} query={query} onNavigate={openLeaf} />
        </SettingsBar>
        {modal}
      </>
    );
  }

  const chrome: FrameChrome = {
    sections: SETTINGS_SECTIONS,
    currentId: NAV_LEAF[screen],
    onNavigate: openLeaf,
    onBack: () => setScreen(null),
    onClose: () => setScreen(null),
    mark: BOOKS_MARK,
    title: TITLES[screen],
    barActions: actions,
  };

  const Body = SCREENS[screen];

  return (
    <FrameContext.Provider value={chrome}>
      <Body onNavigate={setScreen} onOpenRequestAccess={() => setRequestOpen(true)} />
      {modal}
    </FrameContext.Provider>
  );
}

