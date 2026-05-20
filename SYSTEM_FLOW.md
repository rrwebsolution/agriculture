# LGU Gingoog Agriculture Management System
## Final System Process Flow

**Version:** Final v2.0  
**Date:** May 2026  
**Prepared for:** LGU Gingoog - Office of Agriculture

---

## Overview

The LGU Gingoog Agriculture Management System is a role-based web platform for managing agriculture and fishery records, location references, resources, employee information, field check-ins, analytics, and reports.

The final system flow follows this sequence:

```
System Access
  ↓ Administrative Setup
  ↓ Registry Enrollment
  ↓ Location and Risk Setup
  ↓ Sector Operations
  ↓ Resource and Finance Management
  ↓ Employee Operations
  ↓ Dashboard Monitoring
  ↓ Report Generation
```

---

## Phase 1: System Access

```
User opens the system URL
  ↓ Login Page
  ↓ Enter username/email and password
  ↓ System validates account and role
```

### Login Decision

```
Valid credentials + valid role
  ↓ Redirect to Dashboard

Valid credentials but no assigned role
  ↓ Redirect to No Role page

Invalid credentials
  ↓ Show login error
```

### Password Recovery

```
Click "Forgot Password?"
  ↓ Enter registered email
  ↓ Receive password reset link
  ↓ Open reset page
  ↓ Set new password
  ↓ Return to Login
```

### Authenticated Access

```
Authenticated user opens a page
  ↓ System checks required page permission
  ↓ If allowed: display page
  ↓ If not allowed: display Page Not Available
```

---

## Phase 2: Administrative Setup

This baseline setup is normally performed by the Administrator before regular daily operations.

```
Administrator logs in
  ↓ Configure Role Management
  ↓ Configure User Management
  ↓ Configure system reference data
  ↓ Register employee profiles
  ↓ Assign permissions and module access
```

### Role Management

```
Create role
  ↓ Select module permissions
  ↓ Save role
  ↓ Role becomes available for user assignment
```

Permission groups include:

```
Dashboard
  ↓ Overview analytics

Farmer Registry
  ↓ View/manage registered farmers

Fisherfolk Registry
  ↓ View/manage registered fisherfolk

Cooperatives
  ↓ View/manage FFCA cooperative records

Locations
  ↓ Barangay list, work locations, danger zones

Production
  ↓ Crops, planting logs, harvest records

Fishery
  ↓ Fishery production records

Resources
  ↓ Inventory and equipment records

Finance
  ↓ Expenses and financial reports

Administration
  ↓ Employees and employee logs

Access Control
  ↓ Roles and users

System Settings
  ↓ Global settings access
```

### User Management

```
Create user account
  ↓ Link account to employee record where applicable
  ↓ Assign role
  ↓ Save account
  ↓ User can log in based on assigned role permissions
```

---

## Phase 3: Registry Enrollment

Registry records serve as the foundation for production, fishery, finance, barangay, and reporting modules.

```
Farmer Registry
  ↓ Register farmer personal information
  ↓ Encode farm profile and farm location
  ↓ Link barangay, crop, and cooperative where applicable
  ↓ Save farmer record

Fisherfolk Registry
  ↓ Register fisherfolk personal information
  ↓ Encode fishery profile
  ↓ Link barangay and cooperative where applicable
  ↓ Save fisherfolk record

FFCA / Cooperatives
  ↓ Register cooperative profile
  ↓ Link farmer and fisherfolk members
  ↓ Use membership data in barangay and registry views
```

### Registry Dependency Rule

```
Farmer records should exist before planting, harvest, and farmer-linked expenses.
Fisherfolk records should exist before fishery production records.
Cooperative records should exist before assigning members to FFCA groups.
```

---

## Phase 4: Location and Risk Management

Location modules support registry classification, mapping, field assignments, and risk overlays.

### Barangay Profile

```
Open Barangay Profile
  ↓ View barangay metrics
  ↓ Review linked farmers, fisherfolk, cooperatives, crops, and planting logs
  ↓ Open maps and profile details
  ↓ Edit barangay information when permitted
```

### Work Location

```
Open Work Location
  ↓ Add cluster/department/work-location record
  ↓ Set name, description, and status
  ↓ Save record
  ↓ Use as employee assignment reference
```

### Danger Zones

```
Open Danger Zones
  ↓ Add danger zone
  ↓ Enter zone name, type, status, colors, and description
  ↓ Add polygon coordinates manually or upload GPX
  ↓ Preview polygon on map
  ↓ Save danger zone
```

Danger zone polygons are used as map-based risk references for location-aware workflows.

---

## Phase 5: Sector Operations

### Crop Agriculture

```
Crops
  ↓ Maintain crop reference records
  ↓ Use crops in farmer and planting records

Planting Logs
  ↓ Select registered farmer
  ↓ Select farm/location and crop
  ↓ Encode planting date, area, status, and remarks
  ↓ Save planting log

Harvest Records
  ↓ Link harvest to planting/farmer/crop context
  ↓ Encode harvest date, quantity/yield, quality, and status
  ↓ Save harvest record
```

### Fishery

```
Fisheries
  ↓ Select registered fisherfolk/operator
  ↓ Encode fishery type/facility, production volume, date, and remarks
  ↓ Save fishery record
  ↓ Linked data updates fisherfolk and reporting views
```

---

## Phase 6: Resource and Finance Management

### Inventory

```
Add inventory item
  ↓ Encode item details and unit
  ↓ Save item
  ↓ Record stock-in or stock-out transaction
  ↓ Review inventory balances and transaction logs
```

### Equipments

```
Register equipment
  ↓ Encode equipment identity, category, condition, status, and location
  ↓ Save equipment
  ↓ View, update, or delete equipment record when permitted
```

### Expenses

```
Log expense
  ↓ Select category
  ↓ Enter amount, date, description, and optional farmer link
  ↓ Save expense
  ↓ Monitor expense table and monthly cost breakdown
```

---

## Phase 7: Employee Operations

### Employee Information

```
Open Employee Information
  ↓ Add employee profile
  ↓ Encode employee number, name, position, department, work location, supervisor, status, and employment type
  ↓ Upload optional face reference image
  ↓ Save employee record
```

Employee records support user-account linkage, hierarchy views, and Smart Check-In verification.

### Employee Logs / Smart Check-In

```
Employee opens Employee Logs
  ↓ Click Smart Check-In
  ↓ Select employee profile
  ↓ For non-admin users, profile is locked to the linked employee
  ↓ Turn on camera
  ↓ Capture face image
  ↓ Verify face against employee reference image
  ↓ Capture GPS location
  ↓ Save check-in log with timestamp, coordinates, place, status, and match score
```

Access behavior:

```
Administrator / permitted admin role
  ↓ Can view employee logs according to permissions

Non-admin employee
  ↓ Can view only own logs when linked to an employee profile

User without permission
  ↓ Cannot open Employee Logs page
```

---

## Phase 8: Dashboard Monitoring

```
Dashboard opens after login
  ↓ Load key metrics
  ↓ Display charts and map summaries
  ↓ Show recent activities
  ↓ Show weather and barangay weather context
  ↓ Provide quick actions
```

Quick actions include:

```
Add Planting Log
  ↓ Planting Logs

Register Farmer
  ↓ Farmer Registry

Register Fisherfolk
  ↓ Fisherfolk Registry

Log Expense
  ↓ Expenses
```

---

## Phase 9: Reports

```
Open Reports
  ↓ Click Generate Report
  ↓ Select report category and data module
  ↓ Select fields, filters, date range, and output format
  ↓ Generate report
  ↓ View full preview
  ↓ Download PDF or XLSX output
```

Report categories include census, production, barangay profile, financial, and related module-based reports.

---

## Final Overall Data Flow

```
Roles and Users
  ↓ Control module access

Barangay Profiles + Work Locations + Danger Zones
  ↓ Support registry, employee, map, and risk references

Cooperatives
  ↓ Link farmers and fisherfolk

Farmers
  ↓ Link to crops, farm locations, planting logs, harvest records, expenses, barangays, and reports

Fisherfolk
  ↓ Link to fishery records, cooperatives, barangays, and reports

Crops
  ↓ Link to farmer profiles, planting logs, harvest records, dashboard analytics, and reports

Inventory + Equipments + Expenses
  ↓ Support resource tracking, finance monitoring, and reporting

Employees
  ↓ Link to users, work locations, supervisors, and employee logs

All active modules
  ↓ Feed dashboard analytics and report generation
```

---

## Active Module List

```
1. Dashboard
   ↓ Overview metrics, charts, weather, map summaries, and quick actions

2. Farmer Registry
   ↓ Register and manage farmer profiles and farm details

3. Fisherfolk Registry
   ↓ Register and manage fisherfolk profiles and fishery details

4. FFCA (Cooperatives)
   ↓ Manage cooperative profiles and member links

5. Barangay Profile
   ↓ View barangay-level records, tabs, metrics, and maps

6. Work Location
   ↓ Manage work-location reference records

7. Danger Zones
   ↓ Manage polygon-based risk areas

8. Crops
   ↓ Manage crop reference records

9. Planting Logs
   ↓ Track planting activities

10. Harvest Records
    ↓ Track harvest outputs

11. Fisheries
    ↓ Track fishery production records

12. Inventory
    ↓ Manage stock items and stock transactions

13. Equipments
    ↓ Manage equipment records and status

14. Expenses
    ↓ Track agricultural expenses

15. Reports
    ↓ Generate, preview, and download reports

16. Employee Information
    ↓ Manage employee directory and hierarchy

17. Employee Logs
    ↓ Record Smart Check-In logs with face and GPS verification

18. Role Management
    ↓ Manage role permissions

19. User Management
    ↓ Manage user accounts and role assignment

20. Settings
    ↓ Manage profile, password, and appearance preferences
```

---

## Final Access Summary

```
Administrator
  ↓ Full system access

Staff / Encoder
  ↓ Access based on assigned view/manage permissions

Viewer / Limited User
  ↓ Read-only or restricted access based on role permissions

Employee-linked User
  ↓ Can access own employee-related records where allowed
```

---

*LGU Gingoog Agriculture Management System - Final System Process Flow v2.0*  
*Office of Agriculture, Gingoog City, Misamis Oriental*

