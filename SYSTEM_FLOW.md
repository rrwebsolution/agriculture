# LGU Gingoog Agriculture Management System
## System Flow

**Version:** 1.1  
**Date:** April 2026  
**Prepared for:** LGU Gingoog - Office of Agriculture

---

## Overview

The LGU Gingoog Agriculture Management System follows a structured flow from account access, registry and setup, field operations, and resource management up to analytics and reports.

This v1.1 flow includes newly added features:
- Work Location Management
- Danger Zone Management (map polygon risk areas)
- Employee Information Management
- Employee Logs with Smart Check-In (face + GPS verification)

---

## Phase 1: System Access

```
User opens the system URL
        ➡
     Login Page
        ➡
Enter Username/Email + Password
        ➡
Credentials valid?
YES ➡ Dashboard
NO  ➡ Show error or use Forgot Password flow
```

**Forgot Password Flow**
```
Click "Forgot Password?" ➡ Enter registered email
        ➡
Receive reset link via email
        ➡
Open link ➡ Enter new password ➡ Save ➡ Login
```

---

## Phase 2: Initial Setup (Admin, one-time baseline)

Performed by the Administrator before daily operations.

```
Admin logs in
  ➡
1) Role Management
   ➡ Create roles
   ➡ Assign module permissions per role
  ➡
2) User Management
   ➡ Create users and assign roles
  ➡
3) Location Setup
   ➡ Review Barangay Profiles
   ➡ Configure Work Locations (Cluster/Department/Work Location)
   ➡ Configure Danger Zones for risk mapping
  ➡
4) Cooperative Setup
   ➡ Register FFCA (farmers/fisherfolk cooperative groups)
  ➡
5) Production Setup
   ➡ Register crop references
  ➡
6) Employee Setup
   ➡ Register employee profiles
   ➡ Set role, department, work location, supervisor
   ➡ Optional face reference image for smart check-in
```

---

## Phase 3: Registry and Enrollment

```
Farmer Registry
  ➡ Encode name, sex, birth date, contact, barangay,
     cooperative, crops, farm location
        ➡
Fisherfolk Registry
  ➡ Encode name, sex, birth date, contact, barangay, cooperative
        ➡
Cooperatives (FFCA)
  ➡ Link farmer/fisherfolk members
```

> Farmer and fisherfolk records should exist first before linking production, fishery, and expense data.

---

## Phase 4: Sector Operations

### 4.1 Crop Agriculture
```
Crops ➡ Planting Logs ➡ Harvest Records
```

**Planting Logs**
- Select farmer and crop
- Encode date, area, location/barangay, status

**Harvest Records**
- Link to planting record
- Encode harvest date and quantity/yield

### 4.2 Fisheries
- Select fisherfolk/operator
- Encode fishery type/facility, volume, date

---

## Phase 5: Resource and Finance Management

### 5.1 Inventory
```
Add inventory item ➡ Stock In/Out transaction ➡ View transaction logs
```

### 5.2 Equipment
- Register equipment details
- Set assignment/location and status

### 5.3 Expenses
- Encode category, amount, date, description
- Optional linkage to farmer
- View monthly breakdown and table history

---

## Phase 6: Location and Risk Management

### 6.1 Work Location Management
- Manage cluster/department/work-location entries
- Activate/deactivate entries
- Assign staff references per location

### 6.2 Danger Zone Management
```
Create danger zone
  ➡ Set zone name/type/status/colors
  ➡ Add polygon points manually OR upload GPX
  ➡ Preview on map
  ➡ Save
```

Danger zone polygons are used as warning overlays in map-based views.

---

## Phase 7: Employee Operations

### 7.1 Employee Information
- Manage employee directory records
- Set employment details, hierarchy/supervisor, department/work location
- Optional face reference image (for verification workflow)

### 7.2 Employee Logs (Smart Check-In)
```
Employee opens Smart Check-In
  ➡ Select profile (or auto-locked for non-admin)
  ➡ Open camera
  ➡ Face verification against reference image
  ➡ Capture geolocation (GPS)
  ➡ Save log (status In Field, location, coordinates, match score)
```

Admins can view all logs; non-admin employees only see their own logs.

---

## Phase 8: Dashboard, Analytics, and Reports

### Dashboard
- Real-time cards and charts
- Recent activities
- Weather widget
- Quick actions

### Reports
```
Generate Report ➡ Select type and filters/date range
➡ Process report ➡ View/download PDF
```

---

## Overall Data Relationship Flow

```
Barangay Profile
    ➡
Work Location -------- Danger Zones (map overlays)
    ➡
Cooperatives (FFCA)
    ➡
Farmers -------- Fisherfolk
   ➡                ➡
Planting ➡ Harvest  Fisheries

Inventory --- Equipment --- Expenses

Employees ➡ Employee Logs (face + GPS verified check-in)

All modules ➡ Dashboard and Reports
```

---

## Role-Based Access Summary

| Role | Access Level |
|---|---|
| Administrator | Full access to all modules, including access control and employee log deletion |
| Staff / Encoder | Access based on assigned view/manage permissions |
| Viewer / Limited User | Read-only or limited access based on role permissions |

---

## Module List Summary (v1.1)

| # | Module | Purpose |
|---|---|---|
| 1 | Dashboard | Overview, metrics, charts, quick actions |
| 2 | Farmer Registry | Register and manage farmers |
| 3 | Fisherfolk Registry | Register and manage fisherfolk |
| 4 | FFCA (Cooperatives) | Manage cooperative records and members |
| 5 | Barangay Profile | Manage barangay profiles and linked records |
| 6 | Work Location | Manage cluster/department/work-location reference data |
| 7 | Danger Zones | Manage map-based risk polygons |
| 8 | Crops | Register and manage crop references |
| 9 | Planting Logs | Track planting activities |
| 10 | Harvest Records | Track harvest output and status |
| 11 | Fisheries | Track fishery production records |
| 12 | Inventory | Manage supplies and stock movements |
| 13 | Equipments | Manage equipment inventory and assignment |
| 14 | Expenses | Track agricultural costs |
| 15 | Reports | Generate and export PDF reports |
| 16 | Employee Information | Manage employee directory and org hierarchy |
| 17 | Employee Logs | Track employee movement/check-ins with verification |
| 18 | User Management | Manage user accounts (admin/authorized roles) |
| 19 | Role Management | Manage role permissions (admin/authorized roles) |
| 20 | Settings | Profile, security, and appearance preferences |

---

*LGU Gingoog Agriculture Management System - System Flow v1.1*  
*Office of Agriculture, Gingoog City, Misamis Oriental*
