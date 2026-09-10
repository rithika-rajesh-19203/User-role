Design a complete Role-Based Access Control (RBAC) workflow for an ERP application named “Rithika ERP”. Use the attached reference screenshot as the primary visual direction.

Maintain the same visual language:
- Desktop enterprise ERP interface.
- White background with light gray borders.
- Left settings navigation sidebar.
- Compact top header with organization name, back button, settings search, and “Close Settings”.
- Blue primary actions and blue clickable links.
- Rounded cards and buttons with subtle shadows.
- Light lavender selection backgrounds.
- Clean sans-serif typography similar to Inter.
- Dense but readable data tables.
- Use blue #3978E8 or a similar color for primary actions.
- Use dark navy text, muted gray labels, and light gray dividers.
- Keep the UI professional, practical, and consistent with the existing Roles screen.

Create connected screens and interactions for the following workflow:

# 1. Roles listing screen

Create a screen titled “Roles” under:

Organization Settings
- Organization
- Users & Roles
  - Users
  - Roles
  - Role Categories
  - User Preferences
- Taxes & Compliance
- Setup & Configurations
- Customization
- Automation

Module Settings
- General
- Inventory
- Online Payments
- Sales
- Subscriptions
- Purchases
- Travel & Expense

The “Roles” item should be selected in blue.

Main content:
- Page title: “Roles”
- Top-right primary button: “New Role”
- Secondary button near it: “Role Categories”
- Search field: “Search roles”
- Filter controls:
  - Role Category
  - Role Type
  - Status
- Table columns:
  - Role Name
  - Role Category
  - Role Type
  - Description
  - Users
  - Status
  - Actions

Use realistic sample records:
- Accountant
- Accounts Payable Manager
- Accounts Receivable Manager
- Admin
- Employee
- Employee (Payroll Only)
- Employee (Submitter)
- Manufacturing Manager
- Procurement Manager
- Quality Engineer
- Quality Manager
- Retail Manager
- Retail Staff
- Shopfloor Staff

Each row should include a three-dot action menu with:
- View
- Edit
- Duplicate
- Deactivate

# 2. Role Categories listing screen

When the user clicks “Role Categories”, open a screen titled “Role Categories”.

Main content:
- Page title: “Role Categories”
- Descriptive helper text:
  “Create permission boundaries for a group of related roles and assign approvers for access requests.”
- Top-right primary button: “New Role Category”
- Search field: “Search role categories”
- Filters:
  - Status
  - Approver
- Table columns:
  - Category Name
  - Description
  - Roles
  - Base Permissions
  - Approvers
  - Status
  - Last Updated
  - Actions

Sample records:
- Finance Operations
- Inventory & Warehouse
- Sales & Customer Operations
- Manufacturing
- Procurement
- Human Resources
- Retail Operations
- System Administration

Show the number of roles and permissions as compact blue links or count badges.

Example row:
- Finance Operations
- Finance and accounting-related access
- 4 roles
- 28 permissions
- 2 approvers
- Active
- 02 Sep 2026

Empty state:
- Illustration using a simple shield and users icon.
- Text: “No role categories created yet.”
- Button: “Create Role Category”

# 3. Create role category — basic details

When the user clicks “New Role Category”, open a creation flow using either a full-page form or a wide right-side drawer.

Header:
- Back arrow
- Title: “New Role Category”
- Subtitle: “Define the permission boundary and approvers for this category.”

Add a horizontal stepper:
1. Basic Details
2. Base Permissions
3. Approvers
4. Review & Create

Step 1 form:
- Category Name, required
  Placeholder: “e.g. Finance Operations”
- Description, optional
  Placeholder: “Describe the purpose of this role category”
- Category Owner, optional searchable user field
  Placeholder: “Select category owner”
- Status toggle:
  - Active
  - Inactive

Add an information card:
“Roles created under this category can only use permissions included in the category’s base permission set. Role permissions cannot exceed this boundary.”

Footer actions:
- Cancel
- Save as Draft
- Continue

Validation:
- Show inline error if Category Name is empty.
- Prevent duplicate category names.
- Use clear error copy: “A role category with this name already exists.”

# 4. Create role category — base permissions

Step 2 is titled “Set Base Permissions”.

Helper text:
“Select the maximum permissions that roles in this category can receive.”

Layout:
- Left panel: permission module navigation.
- Right panel: permission list.
- Add a search field: “Search permissions”.
- Add a “Select all visible” checkbox.
- Add a selected count: “28 permissions selected”.

Permission modules:
- Organization
- Users & Roles
- Inventory
- Items
- Warehouses
- Sales
- Purchases
- Accounting
- Payments
- Manufacturing
- Reports
- Automation
- Settings

For each permission, show:
- Checkbox
- Permission name
- Permission description
- Access level selector

Permission access levels:
- No Access
- View
- Create
- Edit
- Approve
- Full Access

Example permission rows:
- View Users
- Invite Users
- Edit User Details
- Manage Roles
- Manage Role Categories
- View Items
- Create Items
- Edit Items
- View Warehouses
- Manage Stock Adjustments
- View Sales Orders
- Create Sales Orders
- Approve Sales Orders
- View Purchase Orders
- Create Purchase Orders
- Approve Purchase Orders
- View Bills
- Create Bills
- Approve Payments
- View Reports
- Export Reports

Use grouped permission sections with expandable accordions:
- User Management
- Role Management
- Inventory Management
- Transaction Management
- Approvals
- Reports

Include a warning card:
“Base permissions define the maximum access available to all roles under this category. Review this carefully before creating roles.”

Footer:
- Back
- Save as Draft
- Continue

Interaction:
- Selecting a parent permission selects its child permissions.
- Selecting “Full Access” automatically enables all applicable actions.
- Display a tooltip explaining that role permissions must always remain within this permission set.

# 5. Create role category — approvers

Step 3 is titled “Assign Approvers”.

Helper text:
“Access requests for this role category will be sent to the users selected below.”

Form:
- Approver selection field with multi-select user search.
  Placeholder: “Search and select approvers”
- Selected approvers displayed as user chips with:
  - Avatar
  - Full name
  - Email address
  - Remove icon

Sample approvers:
- Priya Menon — priya.menon@company.com
- Arjun Kumar — arjun.kumar@company.com
- Sneha Rao — sneha.rao@company.com

Approval settings card:
- Approval method:
  - Any one approver
  - All approvers
  - Sequential approval
- Fallback approver, optional
- Escalation after:
  - 1 day
  - 2 days
  - 3 days
  - 5 days
- Enable notification checkbox:
  “Notify approvers when a request is submitted”
- Enable reminder checkbox:
  “Send reminders for pending requests”

Include an approval flow preview:
Request submitted → Approver review → Approved / Rejected

Validation:
- At least one approver is required.
- Display error:
  “Add at least one approver to continue.”

Footer:
- Back
- Save as Draft
- Continue

# 6. Create role category — review and create

Step 4 is titled “Review & Create”.

Display summary cards:

Basic Details
- Category Name
- Description
- Owner
- Status
- Edit link

Base Permissions
- Total selected permissions
- Modules covered
- Access level summary
- Edit link

Approvers
- Number of approvers
- Approval method
- Escalation period
- Edit link

Add a final confirmation checkbox:
“I understand that roles under this category cannot have permissions outside the selected base permission set.”

Primary action:
- “Create Role Category”

Secondary actions:
- Back
- Save as Draft
- Cancel

Success state:
- Green success icon.
- Title: “Role Category created successfully”
- Message: “You can now create roles and assign them to this category.”
- Buttons:
  - Create New Role
  - View Role Category
  - Go to Role Categories

# 7. Role category detail screen

Create a detail screen for a selected category, such as “Finance Operations”.

Header:
- Back button
- Category name: “Finance Operations”
- Status badge: Active
- Actions:
  - Edit Category
  - Deactivate
  - More

Summary cards:
- Roles: 4
- Base Permissions: 28
- Approvers: 2
- Pending Requests: 3

Tabs:
- Overview
- Roles
- Base Permissions
- Approvers
- Access Requests
- Activity Log

Overview content:
- Description
- Category owner
- Created date
- Last updated date
- Approval method
- Request validity policy

Roles tab:
- Button: “New Role”
- Table columns:
  - Role Name
  - Description
  - Permissions
  - Users
  - Status
  - Actions

Important helper message:
“Roles in this category can only contain a subset of the base permissions.”

# 8. New role creation flow

When the user clicks “New Role”, open a role creation screen.

Header:
- Title: “New Role”
- Subtitle: “Create a role within the selected permission boundary.”

Step indicator:
1. Role Details
2. Permissions
3. Assign Users
4. Review

Step 1 — Role Details:
- Role Name, required
- Role Category, required and prefilled
- Role Type:
  - User
  - Employee
  - Retail Staff
  - Shopfloor Staff
- Description
- Status

Step 2 — Permissions:
Show two permission panels:

Left panel:
“Base permissions available”
- Read-only list of permissions inherited from the role category.
- Display all permissions included in the category.

Right panel:
“Permissions assigned to this role”
- Selectable subset of base permissions.
- Search field.
- Grouped by module.
- Access levels cannot exceed the category’s base access level.

Use visual treatment:
- Base-only permissions: muted gray.
- Assigned permissions: blue checkboxes and blue permission chips.
- Permissions unavailable from the category: disabled with lock icon and tooltip:
  “This permission is not included in the role category.”

Display:
“12 of 28 base permissions assigned”

Validation:
- Prevent selecting permissions outside the category.
- If the user attempts to select a restricted permission, show a non-blocking toast:
  “This permission is outside the Finance Operations category boundary.”

Step 3 — Assign Users:
- Search users field.
- Optional user assignment.
- Selected users in a table:
  - User
  - Email
  - Department
  - Current Roles
  - Remove

Step 4 — Review:
- Role details
- Role category
- Assigned permissions
- Assigned users
- Final warning:
  “This role inherits its maximum access from the Finance Operations category.”

Primary action:
- “Create Role”

# 9. Access request — employee request screen

Create an “Access Requests” module under Users & Roles.

Listing screen:
- Page title: “Access Requests”
- Tabs:
  - My Requests
  - Pending My Approval
  - All Requests
- Top-right button: “Request Access”
- Filters:
  - Status
  - Request Type
  - Role Category
  - Requested By
  - Date
- Search field: “Search requests”

Table columns:
- Request ID
- Requested By
- Request Type
- Requested Access
- Role Category
- Validity Period
- Approver
- Status
- Submitted On
- Actions

Statuses:
- Draft
- Pending Approval
- Approved
- Rejected
- Expired
- Cancelled

Request types:
- Role-based access
- Module access
- Permission access

Create access request screen:
Header:
- Title: “Request Access”
- Subtitle: “Request temporary or ongoing access to ERP modules and roles.”

Request type cards:
1. Request a role
   “Get access to a predefined role.”
2. Request a module
   “Request access to a complete ERP module.”
3. Request specific permissions
   “Request individual permissions.”

Fields:
- Request for:
  - Myself
  - Another user, only if permitted
- Role Category
- Role
- Module
- Specific permissions
- Business justification, required
- Priority:
  - Low
  - Medium
  - High
- Access validity:
  - No expiry
  - Custom time period

If custom validity is selected, show:
- Start date
- Start time
- End date
- End time
- Time zone

Show a live request summary card:
- Requested access
- Role category
- Permission count
- Valid from
- Valid until
- Approver route

Approval routing message:
“This request will be sent to the approvers assigned to the selected role category.”

Footer:
- Cancel
- Save Draft
- Submit Request

Validation:
- Business justification is required.
- End date must be after start date.
- The requested role or permission must belong to the selected role category.
- Display clear inline errors.

# 10. Approver access request review screen

Create an approver-facing request detail screen.

Header:
- Back button
- Request ID: “AR-000124”
- Status badge: Pending Approval
- Actions:
  - Approve
  - Reject
  - Request More Information

Top summary:
- Requested by: Kavya Srinivasan
- Email: kavya.srinivasan@company.com
- Department: Finance
- Submitted: 02 Sep 2026, 03:20 PM
- Request type: Role-based access
- Role category: Finance Operations
- Requested role: Accounts Payable Manager

Access comparison card:
Two columns:
- Current Access
- Requested Access

Display permission changes using:
- Added permissions in blue or green.
- Removed permissions in red.
- Unchanged permissions in gray.

Requested validity:
- Start: 03 Sep 2026
- End: 30 Sep 2026
- Time zone: Asia/Kolkata

Allow the approver to modify validity:
- Editable start date and time.
- Editable end date and time.
- Checkbox:
  “Approve with modified validity period.”

Decision panel:
- Approval comments, optional for approval.
- Rejection reason, required when rejecting.
- Request more information comment, required when requesting information.

Actions:
- Approve Request
- Reject Request
- Request More Information
- Cancel

Confirmation modal for approval:
Title: “Approve access request?”
Content:
“Access will be granted to Kavya Srinivasan for the selected role and validity period.”
Show:
- Role
- Permission count
- Start date
- End date
Buttons:
- Cancel
- Confirm Approval

Confirmation modal for rejection:
Title: “Reject access request?”
Fields:
- Rejection reason, required
Buttons:
- Cancel
- Confirm Rejection

# 11. Access request status and audit trail

Add an “Activity Log” section to the request detail page.

Timeline entries:
- Request submitted by Kavya Srinivasan.
- Routed to Priya Menon and Arjun Kumar.
- Validity changed by Priya Menon.
- Request approved.
- Access provisioned.
- Access expired.

Each timeline item should display:
- Actor
- Action
- Date and time
- Comments
- Old and new validity period where applicable

Add a “Permission Snapshot” card:
- Permissions at request time.
- Permissions currently active.
- Expiration status.

# 12. Prototype interactions

Connect the prototype interactions:
- Roles → New Role → Role Details → Permissions → Assign Users → Review → Success.
- Roles → Role Categories.
- Role Categories → New Role Category → Basic Details → Base Permissions → Approvers → Review → Success.
- Role Category detail → New Role.
- Users & Roles → Access Requests.
- Access Requests → Request Access → Request Type → Form → Submit.
- Pending My Approval → Request detail → Approve, Reject, or Request More Information.
- Approve → confirmation modal → Approved state.
- Reject → rejection modal → Rejected state.
- Edit validity → updated validity displayed in the request timeline.
- Search, filters, tabs, accordions, dropdowns, checkboxes, chips, and pagination should have realistic interactive states.

# 13. Design system and component states

Create reusable Figma components and variants for:
- Primary, secondary, tertiary, and destructive buttons.
- Text inputs.
- Search inputs.
- Dropdowns.
- Multi-select user fields.
- Permission checkboxes.
- Permission access-level dropdowns.
- Status badges.
- Role and permission chips.
- Toast notifications.
- Confirmation modals.
- Stepper.
- Tabs.
- Tables.
- Empty states.
- Warning and information cards.
- User avatars.
- Three-dot action menus.

Include component states:
- Default
- Hover
- Focus
- Selected
- Disabled
- Error
- Success
- Loading

Use Auto Layout throughout. Use an 8 px spacing system, consistent 12–16 px corner radii, and responsive desktop layouts. Ensure the interface remains visually consistent with the provided ERP Roles screen.