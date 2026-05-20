# LGU Gingoog Agriculture Management System
## Final User Manual / User Guide

**Version:** Final v2.0  
**Date:** May 2026  
**Prepared for:** LGU Gingoog - Office of Agriculture

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Account Access](#2-account-access)
3. [Navigation and Permissions](#3-navigation-and-permissions)
4. [Dashboard](#4-dashboard)
5. [Registries](#5-registries)
6. [Locations and Risk Mapping](#6-locations-and-risk-mapping)
7. [Sector Operations](#7-sector-operations)
8. [Resources and Finance](#8-resources-and-finance)
9. [Employee Management](#9-employee-management)
10. [Reports](#10-reports)
11. [Access Control](#11-access-control)
12. [Settings](#12-settings)
13. [Common Issues and FAQ](#13-common-issues-and-faq)

---

## 1. Introduction

The LGU Gingoog Agriculture Management System is a web-based platform used by the Office of Agriculture to manage:

- Farmer and fisherfolk registry records
- FFCA cooperative records and membership links
- Barangay, work-location, and danger-zone references
- Crop, planting, harvest, and fishery operations
- Inventory, equipment, and expense records
- Employee information and Smart Check-In logs
- Dashboard analytics and generated reports

### User Roles

```
Administrator
  ↓ Has full system access and can manage roles, users, and all modules

Staff / Encoder
  ↓ Can view or manage modules depending on assigned permissions

Viewer / Limited User
  ↓ Can access only permitted read-only or restricted pages

Employee-linked User
  ↓ Can use employee-related features based on account linkage and permissions
```

---

## 2. Account Access

### 2.1 Login

1. Open the system URL.
2. Enter your username/email and password.
3. Click `Login`.
4. If your account is valid and has a role, the Dashboard will open.

### 2.2 No Role Assigned

If your login is successful but the system shows a No Role page, contact the Administrator. Your user account must be assigned a role before you can use the system modules.

### 2.3 Forgot Password

1. Click `Forgot Password?` on the login page.
2. Enter your registered email address.
3. Open the reset link sent to your email.
4. Enter and confirm your new password.
5. Return to the login page and sign in.

### 2.4 Logout

1. Open the profile menu in the top-right area.
2. Click `Logout`.

---

## 3. Navigation and Permissions

The sidebar shows only the modules allowed by your assigned role. If a module is missing, your role may not have the required permission.

Main sidebar groups:

```
Overview
  ↓ Dashboard

Registries
  ↓ Farmer Registry, Fisherfolk Registry, FFCA (Cooperatives)

Locations
  ↓ Barangay Profile, Work Location, Danger Zones

Sector Operations
  ↓ Crops, Planting Logs, Harvest Records, Fishery

Management
  ↓ Inventory, Equipments, Expense, Reports

Employees
  ↓ Employee Information, Employee Logs

Administration
  ↓ Role Management, User Management
```

There are two common permission levels:

```
View
  ↓ Allows opening and viewing module records

Manage
  ↓ Allows adding, editing, deleting, or performing module actions
```

---

## 4. Dashboard

The Dashboard provides an overview of system activity and current agricultural information.

### Dashboard Areas

- Summary metric cards
- Charts and production visuals
- Farmer/barangay map summaries
- Recent activity list
- Weather and barangay weather context
- Quick action buttons

### Quick Actions

```
Add Planting Log
  ↓ Opens Planting Logs with add workflow

Register Farmer
  ↓ Opens Farmer Registry with registration workflow

Register Fisherfolk
  ↓ Opens Fisherfolk Registry with registration workflow

Log Expense
  ↓ Opens Expenses with log workflow
```

---

## 5. Registries

### 5.1 Farmer Registry

Use Farmer Registry to register and manage farmer profiles.

Typical information includes:

- Personal details such as name, sex, birth date, and contact number
- Barangay and address information
- Cooperative membership
- Crop and livelihood information
- Farm profile, area, and location details

Common actions:

1. Click `Register Farmer`.
2. Fill in the required personal and farm profile fields.
3. Select barangay, crop, and cooperative if applicable.
4. Save the record.
5. Use the table action buttons to view, edit, or delete records when permitted.

### 5.2 Fisherfolk Registry

Use Fisherfolk Registry to register and manage fisherfolk records.

Typical information includes:

- Personal details such as name, sex, birth date, and contact number
- Barangay and address information
- Cooperative membership
- Fishery profile and related information

Common actions:

1. Click `Register Fisherfolk`.
2. Complete the personal and fishery profile fields.
3. Select barangay and cooperative if applicable.
4. Save the record.
5. View, edit, or delete records according to your permissions.

### 5.3 FFCA (Cooperatives)

Use FFCA (Cooperatives) to manage cooperative records and member relationships.

Common actions:

1. Add or update cooperative profile information.
2. Review linked farmer and fisherfolk members.
3. Open member lists to verify cooperative membership.
4. Use cooperative data in barangay, registry, and reporting views.

---

## 6. Locations and Risk Mapping

### 6.1 Barangay Profile

Barangay Profile shows barangay-level data and linked records.

Available information may include:

- Barangay metrics
- Farmer list
- Fisherfolk list
- Cooperative list
- Crop and planting information
- Map/profile views

Common actions:

1. Open `Barangay Profile`.
2. Search or select a barangay record.
3. View linked tabs and map information.
4. Edit barangay details when your role has manage permission.

### 6.2 Work Location

Work Location manages reference records used for employee assignment and office/field grouping.

Common actions:

1. Open `Work Location`.
2. Add a new work-location record.
3. Enter name, description, and status.
4. Save the record.
5. Edit or deactivate entries when needed.

### 6.3 Danger Zones

Danger Zones manages risk areas using map polygons.

Add a danger zone:

1. Open `Danger Zones`.
2. Click the add button.
3. Enter zone name, type, description, status, and display colors.
4. Add polygon coordinates manually or upload a `.gpx` file.
5. Review the polygon preview on the map.
6. Save the danger zone.

Use the table action buttons to view, edit, or delete danger-zone records according to your permissions.

---

## 7. Sector Operations

### 7.1 Crops

Use Crops to maintain crop reference records used by farmer, planting, harvest, dashboard, and report modules.

Common actions:

1. Add a crop record.
2. Enter crop name and related details.
3. Save the crop.
4. View or update crop information as needed.

### 7.2 Planting Logs

Use Planting Logs to record planting activities.

Typical fields:

- Farmer
- Farm/location or barangay
- Crop
- Planting date
- Area
- Status and remarks

Common actions:

1. Click `Add Planting Log`.
2. Select a registered farmer.
3. Select crop and location details.
4. Enter planting date, area, and status.
5. Save the log.

### 7.3 Harvest Records

Use Harvest Records to record crop production outputs.

Typical fields:

- Farmer or planting context
- Crop
- Harvest date
- Quantity/yield
- Quality/status

Common actions:

1. Click the add button in Harvest Records.
2. Select the related farmer/planting/crop information.
3. Enter harvest quantity, date, quality, and status.
4. Save the harvest record.

### 7.4 Fisheries

Use Fisheries to record fishery production data.

Typical fields:

- Fisherfolk/operator
- Fishery type or facility
- Production volume
- Date
- Remarks or status

Common actions:

1. Add a fishery record.
2. Select a registered fisherfolk/operator.
3. Enter fishery details, volume, and date.
4. Save the record.

---

## 8. Resources and Finance

### 8.1 Inventory

Use Inventory to manage supplies and stock movement.

Main workflow:

1. Add an inventory item.
2. Enter item details, category, and unit.
3. Save the item.
4. Record `Stock In` or `Stock Out` transactions.
5. Review transaction logs and current balances.

### 8.2 Equipments

Use Equipments to manage equipment records.

Common actions:

1. Add equipment.
2. Enter equipment identity, category, condition, status, and assigned location.
3. Save the record.
4. View, edit, or delete equipment entries according to your permissions.

### 8.3 Expenses

Use Expenses to log and monitor agricultural costs.

Typical fields:

- Category
- Amount
- Date
- Description
- Optional farmer link

Common actions:

1. Click `Log Expense`.
2. Select category and enter amount/date.
3. Add description and optional farmer link.
4. Save the expense.
5. Review the expense table and monthly cost breakdown.

---

## 9. Employee Management

### 9.1 Employee Information

Use Employee Information to maintain employee records and hierarchy.

Typical fields:

- Employee number
- First name and last name
- Role/position
- Department/work location
- Supervisor
- Employment type
- Status
- Optional face reference image

Add employee:

1. Open `Employee Information`.
2. Click `Add Employee`.
3. Complete all required employee fields.
4. Upload a face reference image if the employee will use Smart Check-In.
5. Save the employee record.

### 9.2 Employee Logs

Employee Logs records field movement and check-ins.

Access behavior:

- Admin/permitted users can view logs according to assigned permissions.
- Non-admin employee users can only view their own logs when linked to an employee record.
- Users without Employee Logs permission cannot open the module.

### 9.3 Smart Check-In

Smart Check-In verifies the employee using face recognition and GPS.

Workflow:

1. Open `Employee Logs`.
2. Click `Smart Check-In`.
3. Select employee profile. Non-admin users may have this locked automatically.
4. Allow camera permission.
5. Make sure the face is clear in the preview.
6. Click the scan/check-in button.
7. Allow location/GPS permission.
8. Wait for face verification and GPS capture.
9. The system saves the log with date/time, status, location, coordinates, and match score.

If Smart Check-In fails, check camera permission, browser location permission, internet connection, and the employee face reference image.

---

## 10. Reports

Use Reports to generate, preview, and download system records.

Generate report:

1. Open `Reports`.
2. Click `Generate Report`.
3. Select report category and data module.
4. Choose fields, filters, and date range.
5. Select output format: `PDF` or `XLSX`.
6. Generate the report.
7. View the report preview.
8. Download the output file if needed.

Report data depends on your access permissions and available module records.

---

## 11. Access Control

Access Control is intended for Administrators or authorized staff.

### 11.1 Role Management

Use Role Management to define what users can view or manage.

Common actions:

1. Open `Role Management`.
2. Click `Add New Role`.
3. Enter role name and description.
4. Select module permissions.
5. Save the role.
6. Edit roles if permissions need to be changed.

### 11.2 User Management

Use User Management to create and maintain system login accounts.

Common actions:

1. Open `User Management`.
2. Add or edit a user account.
3. Link the account to an employee record where applicable.
4. Assign the correct role.
5. Save the account.
6. Deactivate or delete users only when authorized.

---

## 12. Settings

Settings contains account and display preferences.

### 12.1 My Profile

Use this tab to update your own profile information such as name and email.

### 12.2 Security

Use this tab to change your password.

### 12.3 Appearance

Use this tab to apply the interface theme:

- Light
- Dark
- System

The top header also provides a quick theme selector.

---

## 13. Common Issues and FAQ

**Q: Why can I not see a module in the sidebar?**  
A: Your role may not have the required view permission for that module.

**Q: Why can I open a page but cannot add or edit records?**  
A: You may only have view permission. Ask the Administrator if you need manage permission.

**Q: Why did I reach the No Role page after login?**  
A: Your account has no assigned role. The Administrator must assign one.

**Q: Why does Smart Check-In fail?**  
A: Check camera permission, location permission, internet connection, and whether your employee profile has a face reference image.

**Q: Can non-admin employees see other employees' logs?**  
A: No. Non-admin employee users are limited to their own logs when employee account linkage is enforced.

**Q: Can reports be exported?**  
A: Yes. Reports can be generated and downloaded in PDF or XLSX format, depending on selected output.

**Q: How do I add map risk areas?**  
A: Open `Danger Zones`, then add polygon coordinates manually or upload a `.gpx` file.

**Q: Why is a report missing some records?**  
A: Check filters, date range, selected module fields, and your access permissions.

---

*LGU Gingoog Agriculture Management System - Final User Manual v2.0*  
*Office of Agriculture, Gingoog City, Misamis Oriental*
