/** The same routes as v1, so the two versions stay comparable screen for screen. */
export type Screen =
  | "users"
  | "roles"
  | "new-role"
  | "role-categories"
  | "create-role-category"
  | "role-category-detail"
  | "my-role-requests";

export interface ScreenProps {
  onNavigate: (screen: Screen) => void;
  /** Opens the Request Role modal, which App owns. */
  onOpenRequestAccess: () => void;
}
