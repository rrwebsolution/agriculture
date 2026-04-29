# LGU Gingoog Agriculture Management System
## User Manual / User Guide

**Version:** 1.1  
**Date:** April 2026  
**Prepared for:** LGU Gingoog - Office of Agriculture

---

## Table of Contents

1. [Introduction](#1-introduction)  
2. [Getting Started](#2-getting-started)  
3. [Dashboard](#3-dashboard)  
4. [Registries](#4-registries)  
5. [Locations and Risk Mapping](#5-locations-and-risk-mapping)  
6. [Sector Operations](#6-sector-operations)  
7. [Resources and Finance](#7-resources-and-finance)  
8. [Employee Information](#8-employee-information)  
9. [Employee Logs (Smart Check-In)](#9-employee-logs-smart-check-in)  
10. [Reports](#10-reports)  
11. [Access Control (Admin)](#11-access-control-admin)  
12. [Settings](#12-settings)  
13. [FAQ](#13-faq)

---

## 1. Introduction

The LGU Gingoog Agriculture Management System is a web platform for managing:
- Farmer and fisherfolk registries
- Crop and fishery operations
- Inventory, equipment, and expenses
- Location and danger zone mapping
- Employee directory and employee field logs
- Reports and analytics

### User Roles

| Role | Access |
|---|---|
| Administrator | Full system access |
| Staff / Encoder | Access based on assigned permissions |
| Viewer / Limited User | Read-only or restricted access |

---

## 2. Getting Started

### 2.1 Login
1. Open the system URL.
2. Enter your username/email and password.
3. Click `Login`.

### 2.2 Forgot Password
1. Click `Forgot Password?` on the login page.
2. Enter your registered email.
3. Open the reset link from email.
4. Set a new password and log in.

### 2.3 Logout
1. Click your account/profile menu.
2. Select `Logout`.

---

## 3. Dashboard

The Dashboard provides a quick overview of system activity.

### Key Areas
- Metric cards (totals and summaries)
- Charts and trend visuals
- Recent activity list
- Weather widget
- Quick action buttons

---

## 4. Registries

### 4.1 Farmer Registry
Use this module to add, edit, view, and manage farmer profiles.

Main fields:
- Name, birth date, sex, contact number
- Barangay, cooperative
- Crop profile and farm location

### 4.2 Fisherfolk Registry
Use this module to add, edit, view, and manage fisherfolk profiles.

Main fields:
- Name, birth date, sex, contact number
- Barangay, cooperative

### 4.3 FFCA (Cooperatives)
Manage cooperative records and membership links for farmers and fisherfolk.

---

## 5. Locations and Risk Mapping

### 5.1 Barangay Profile
View barangay-level records and linked tabs (farmers, fisherfolk, crops, etc.).

### 5.2 Work Location
This module manages cluster/department/work-location reference entries.

Common actions:
1. Add a new entry.
2. Set name, description, and status.
3. Edit or deactivate entries when needed.

### 5.3 Danger Zones
This module manages map-based risk polygons.

#### Add a Danger Zone
1. Click `Add Danger Zone`.
2. Fill in zone name, type, description, status, and colors.
3. Add polygon coordinates (one `lat,lng` per line) or upload a `.gpx` file.
4. Review/adjust the polygon on the map preview.
5. Save.

#### Edit/View/Delete
- Use action buttons in the zone list to view details, edit, or delete.

---

## 6. Sector Operations

### 6.1 Crops
Manage crop references and crop analytics.

### 6.2 Planting Logs
Track planting records for registered farmers.

Typical fields:
- Farmer, crop, date, location/barangay, area, status

### 6.3 Harvest Records
Track harvest records linked to planting logs.

Typical fields:
- Farmer, crop, linked planting record, date, quantity/yield

### 6.4 Fisheries
Track fishery production and related records.

Typical fields:
- Fisherfolk/operator, facility/type, volume, date

---

## 7. Resources and Finance

### 7.1 Inventory
Manage stock items and transaction logs.

Main workflow:
1. Add inventory item.
2. Record stock in/out transaction.
3. Review transaction history.

### 7.2 Equipments
Register equipment and manage assignment/status.

### 7.3 Expenses
Log and monitor agricultural expenses.

Main fields:
- Category, amount, date, description
- Optional farmer link

---

## 8. Employee Information

Use this module to maintain employee records and hierarchy.

### Main Features
- Employee directory list
- Organization/hierarchy tree
- Add/edit/delete employee record
- Department and work-location assignment
- Supervisor assignment
- Employment type and status
- Optional face reference image upload

### Add Employee
1. Click `Add Employee`.
2. Complete required fields (employee no., name, role/position, department, work location, status, employment type).
3. Optional: upload face reference image.
4. Save.

---

## 9. Employee Logs (Smart Check-In)

This module records employee movement logs with secure face + location verification.

### Access Rules
- Administrator: can view all employee logs.
- Non-admin employee: only sees own logs.

### Smart Check-In Workflow
1. Click `Smart Check-In`.
2. Select employee profile (auto-locked for non-admin where applicable).
3. Turn on camera.
4. Ensure face is clear in preview.
5. Click `Scan & Check-In`.
6. System verifies face against reference image.
7. System captures GPS location.
8. Log is saved with date/time, status, location, coordinates, and match score.

### History and Details
- Toggle Today/History views.
- Search logs by employee/place/assignment.
- View full log details including verification info.
- Admin can delete logs.

---

## 10. Reports

Use this module to generate and export PDF reports.

### Generate Report
1. Open `Reports`.
2. Click `Generate Report`.
3. Select report type and filters/date range.
4. Generate.
5. View or download PDF output.

---

## 11. Access Control (Admin)

### 11.1 Role Management
- Create roles
- Assign module permissions
- Edit/update permission coverage

### 11.2 User Management
- Create user accounts
- Assign role to user
- Edit/deactivate/delete users

---

## 12. Settings

Settings are grouped into three tabs:

### 12.1 My Profile
- Update own name and email

### 12.2 Security
- Change password

### 12.3 Appearance
- Theme selection: Light, Dark, or System

---

## 13. FAQ

**Q: Why can I not see some modules in the sidebar?**  
A: Your role may not have the required permission.

**Q: Why can I not open Employee Logs for other employees?**  
A: Non-admin users are restricted to their own logs.

**Q: Why does Smart Check-In fail?**  
A: Check camera permission, location permission, internet, and whether your face reference image is registered.

**Q: How do I add map risk areas?**  
A: Use `Danger Zones`, then input coordinates manually or upload `.gpx`.

**Q: Can reports be exported?**  
A: Yes, reports can be generated and downloaded as PDF.

---

*LGU Gingoog Agriculture Management System - User Manual v1.1*  
*Office of Agriculture, Gingoog City, Misamis Oriental*
