# LGU Gingoog Agriculture Management System
## System Flow

**Version:** 1.0
**Date:** April 2026
**Prepared for:** LGU Gingoog — Office of Agriculture

---

## Overview

The LGU Gingoog Agriculture Management System follows a structured flow — from initial system setup, to registry and data encoding, to production tracking, resource management, and finally reporting and monitoring.

---

## Phase 1: System Access

```
User opens the system URL
        ↓
    Login Page
        ↓
Enter Username/Email + Password
        ↓
   Credentials valid?
   YES → Dashboard        NO → Show error / Forgot Password flow
```

**Forgot Password Flow:**
```
Click "Forgot Password?" → Enter registered email
        ↓
Receive reset link via email
        ↓
Click link → Enter new password → Save → Login
```

---

## Phase 2: Initial Setup (Admin — One-time)

Performed by the Administrator before regular use of the system.

```
Admin logs in
        ↓
1. Role Management
   → Create roles (e.g., Data Encoder, Fishery Officer)
   → Assign module permissions per role
        ↓
2. User Management
   → Create user accounts
   → Assign roles to users
        ↓
3. Barangay Management
   → Verify and update barangay profiles
        ↓
4. Cluster / Sector Management
   → Set up agricultural zones / clusters
        ↓
5. Cooperatives
   → Register cooperatives (Farmers / Fisherfolk / Both)
        ↓
6. Crop Management
   → Register crop types and categories
```

---

## Phase 3: Registry / Enrollment

Staff encodes all registered farmers and fisherfolk.

```
Farmer Registry
  → Register: Full Name, Date of Birth, Gender,
    Contact Number, Barangay, Cooperative, Crops, Farm Location
        ↓
Fisherfolk Registry
  → Register: Full Name, Date of Birth, Gender,
    Contact Number, Barangay, Cooperative
```

> Farmers and fisherfolk must be registered before they can be linked to production records, livestock, or expenses.

---

## Phase 4: Agricultural Production Tracking

```
Planting Log
  → Select Farmer
  → Select Crop Type
  → Enter Planting Date, Location / Barangay, Area (hectares)
  → Set Status: Ongoing / Completed
        ↓
        (When crops are harvested)
        ↓
Harvest Management
  → Select Farmer
  → Select Crop Type
  → Link to existing Planting Log record
  → Enter Harvest Date and Yield / Quantity (kg or tons)
```

---

## Phase 5: Fisheries & Livestock

These modules run in parallel with crop production tracking.

**Fisheries Management:**
```
Add Fishery Record
  → Select Fisherfolk / Operator
  → Enter Fishery Type / Facility
  → Enter Production Volume and Date
  → Save
```

**Livestock Management:**
```
Add Livestock Record
  → Select Owner (Farmer or Fisherfolk)
  → Enter Animal Type, Breed, Population
  → Set Health Status and Vaccination Status
  → Assign Location / Cluster
  → Save
```

---

## Phase 6: Resources & Finance

**Inventory Management:**
```
Register Inventory Item (Name, Category, Unit, Initial Stock)
        ↓
Record Transactions
  → Stock In: items received
  → Stock Out: items used / dispensed
        ↓
View Transaction History per Item
```

**Equipment Management:**
```
Register Equipment
  → Name, Type/Category, Serial Number, Condition/Status
  → Assign to Cluster / Location
```

**Expenses Management:**
```
Log Expense
  → Link to Farmer (if applicable)
  → Category: Seeds, Fertilizer, Labor, etc.
  → Enter Amount, Date, Description
        ↓
View Monthly Expense Breakdown by Category
```

---

## Phase 7: Reports & Analytics

```
Dashboard (Real-time)
  → Summary metric cards: Total Farmers, Fisherfolk, Crops,
    Harvests, Fisheries, Expenses
  → Weather widget (Gingoog City)
  → Bar and Pie charts
  → Recent activity log
  → Quick action buttons
        ↓
Reports Module
  → Click "Generate Report"
  → Select Report Type:
    - Farmer Registry Report
    - Fishery Production Report
    - Financial / Expense Report
    - Crop Production Report
    - Harvest Report
  → Set Date Range / Filters
  → Click "Generate"
  → Download as PDF
```

---


## Overall Data Relationship Flow

```
           Barangay / Cluster
                  ↓
            Cooperative
                  ↓
       Farmer ──────── Fisherfolk
          ↓                 ↓
   Planting Log         Fisheries Record
          ↓
   Harvest Record

   Farmer / Fisherfolk
          ↓
   Livestock Record

   Inventory ─── Equipment ─── Expenses
          ↓
      Resources

   All Data → Dashboard & Reports
```

---

## Role-Based Access Summary

| Role          | Access Level                                      |
|---------------|---------------------------------------------------|
| Administrator | Full access to all modules including User & Role Management |
| Staff/Encoder | Access based on assigned role permissions         |
| Viewer        | Read-only access to assigned modules              |

---

## Module List Summary

| # | Module              | Purpose                                         |
|---|---------------------|-------------------------------------------------|
| 1 | Dashboard           | Overview, metrics, charts, quick actions        |
| 2 | Farmer Registry     | Register and manage farmers                     |
| 3 | Fisherfolk Registry | Register and manage fisherfolk                  |
| 4 | Cooperatives        | Manage farmer/fisherfolk cooperatives           |
| 5 | Barangay            | Manage barangay profiles and linked data        |
| 6 | Clusters            | Group barangays/farmers by agricultural zone    |
| 7 | Crops               | Register and manage crop types                  |
| 8 | Planting Logs       | Record planting activities                      |
| 9 | Harvest             | Record crop harvest yields                      |
| 10 | Fisheries          | Track fishery production                        |
| 11 | Livestock          | Track livestock owned by farmers/fisherfolk     |
| 12 | Inventory          | Manage farm supplies and stock                  |
| 13 | Equipment          | Register and track farm equipment               |
| 14 | Expenses           | Log and track agricultural expenses             |
| 15 | Reports            | Generate and download PDF reports               |
| 16 | User Management    | Manage system user accounts (Admin only)        |
| 17 | Role Management    | Manage roles and permissions (Admin only)       |
| 18 | Settings           | System preferences and branding                 |

---

*LGU Gingoog Agriculture Management System — System Flow v1.0*
*Office of Agriculture, Gingoog City, Misamis Oriental*

