# 📘 Frontend-HQ System Documentation
## ระบบบริหารจัดการสำนักงานใหญ่ — BAIMIANG Healthy Shop

> **Version:** 1.0.0  
> **Tech Stack:** React 19 + Vite 8 + TailwindCSS 3 + Axios  
> **Backend API:** REST API ผ่าน `/hq/*` endpoints  
> **Last Updated:** 30 เมษายน 2569

---

## 📑 สารบัญ

1. [ภาพรวมระบบ (System Overview)](#1-ภาพรวมระบบ)
2. [สถาปัตยกรรม (Architecture)](#2-สถาปัตยกรรม)
3. [ระบบสิทธิ์ผู้ใช้งาน (Roles & Permissions)](#3-ระบบสิทธิ์ผู้ใช้งาน)
4. [หน้าสาธารณะ — User Zone](#4-หน้าสาธารณะ--user-zone)
5. [หน้า Admin Dashboard](#5-หน้า-admin-dashboard)
6. [ระบบ Authentication](#6-ระบบ-authentication)
7. [Service Layer & API](#7-service-layer--api)
8. [โครงสร้างไฟล์ (File Structure)](#8-โครงสร้างไฟล์)
9. [Business Logic & กฎเกณฑ์](#9-business-logic--กฎเกณฑ์)

---

## 1. ภาพรวมระบบ

Frontend-HQ เป็นระบบ **Web Application** สำหรับบริหารจัดการข้อมูลภายในองค์กร BAIMIANG Healthy Shop ใช้ในระดับ **สำนักงานใหญ่ (HQ)** โดยมีวัตถุประสงค์หลัก:

- **บันทึกยอดขายรายวัน** ของพนักงานแต่ละสาขา
- **ระบบแต้มสะสม (Point System)** — ให้คะแนนพนักงานที่ทำยอดขายผ่านเป้า
- **ระบบแลกของรางวัล (Reward Redemption)** — พนักงานใช้แต้มแลกรางวัล
- **Dashboard สำหรับ Admin** — จัดการสาขา, พนักงาน, รางวัล, บันทึกกิจกรรม
- **ตรวจสอบยอดขาย Hit Target** — อัปโหลดไฟล์ Excel เพื่อตรวจสอบสาขาที่ทำยอดผ่านเป้า

---

## 2. สถาปัตยกรรม

```
┌─────────────────────────────────────────────────┐
│                  Frontend-HQ (Vite + React)     │
├─────────────────────────────────────────────────┤
│  Pages                                          │
│  ├── MainPage (Public)  ← User ทุกคนเข้าถึงได้   │
│  ├── LoginPage          ← เข้าสู่ระบบ/ลงทะเบียน   │
│  └── DashboardPage      ← Admin Only (Protected) │
├─────────────────────────────────────────────────┤
│  Services (API Layer)                           │
│  ├── authService     → /hq/auth/*               │
│  ├── employeeService → /hq/employees/*          │
│  ├── branchService   → /hq/branches/*           │
│  ├── rewardService   → /hq/rewards/*            │
│  └── logService      → /hq/logs/*               │
├─────────────────────────────────────────────────┤
│  Config                                         │
│  └── api.js (Axios instance + interceptors)     │
└──────────────────┬──────────────────────────────┘
                   │ HTTP (Bearer Token)
                   ▼
          ┌────────────────┐
          │  Backend API   │
          │  (Node.js)     │
          └────────────────┘
```

### การจัดการ State

- **Local State** — ใช้ `useState` / `useEffect` ในแต่ละ Component
- **Auth State** — เก็บ `token` และ `user` ใน `localStorage`
- **Dashboard Section** — จำค่า section ที่เลือกไว้ใน `localStorage` (`hq_dashboard_section`)

---

## 3. ระบบสิทธิ์ผู้ใช้งาน

| คุณสมบัติ | User (พนักงาน) | Admin (ผู้ดูแลระบบ) |
|---|---|---|
| ดู Scoreboard (ตารางคะแนน) | ✅ | ✅ |
| เช็คแต้มสะสม | ✅ | ✅ |
| ดูรางวัล + แลกรางวัล | ✅ | ✅ |
| บันทึกยอดขาย (SalesLogForm) | ✅ | ✅ |
| เข้า Dashboard จัดการระบบ | ❌ | ✅ |
| จัดการสาขา (CRUD) | ❌ | ✅ |
| จัดการพนักงาน (CRUD) | ❌ | ✅ |
| จัดการรางวัล (CRUD) | ❌ | ✅ |
| เพิ่ม/หักแต้มพนักงาน | ❌ | ✅ |
| ดู/ค้นหา/Export บันทึกกิจกรรม | ❌ | ✅ |
| Hit Target Check (อัปโหลด Excel) | ❌ | ✅ |
| ต้องใช้รหัสผ่านเข้าระบบ | ❌ (ไม่จำเป็น) | ✅ |

### การป้องกันเส้นทาง (Route Protection)

```
PrivateRoute → ตรวจสอบ isAuthenticated + adminOnly
  - ถ้าไม่ login → redirect ไป /login
  - ถ้า login แต่ไม่ใช่ admin → redirect ไป /
```

---

## 4. หน้าสาธารณะ — User Zone

### 4.1 MainPage (`/`)

หน้าหลักที่ **ทุกคนเข้าถึงได้** โดยไม่ต้อง login ประกอบด้วย:

#### 📊 Scoreboard (ตารางคะแนนพนักงาน)
- แสดง **อันดับพนักงานทั้งหมด** เรียงตาม `point_earned` มากไปน้อย
- แสดงเฉพาะพนักงาน role `user` ที่ status `active`
- มีระบบ **Tier** แบ่งตามคะแนน:

| Tier | คะแนน | สี |
|---|---|---|
| 💎 Diamond | 65+ | น้ำเงิน |
| 🥇 Gold | 31–64 | เหลือง |
| 🥈 Silver | 20–30 | เทา |
| 🟤 Non | 0–19 | ส้ม |

- แสดงสรุปจำนวนคนในแต่ละ Tier ด้านบน
- รองรับ **Pagination** (10 รายการต่อหน้า)
- มี **Mobile Card View** และ **Desktop Table View**

#### 🔍 PointChecker (เช็คแต้มสะสม)
- ใส่ **รหัสพนักงาน 5 หลัก** เพื่อตรวจสอบ
- แสดงข้อมูล: คะแนนสะสม, คะแนนที่ใช้ไป, คะแนนคงเหลือ
- ตรวจสอบสถานะ — ถ้า `inactive` จะแสดงข้อความแจ้ง
- `point_redeemed` = ยอดคงเหลือที่ใช้แลกได้จริง

#### 🎁 RewardSection (แลกของรางวัล)
- แสดงรายการ **รางวัลทั้งหมด** พร้อมรูปภาพคูปอง
- แต่ละรางวัลมี: ชื่อ, แต้มที่ต้องใช้
- กดปุ่ม **"แลกรางวัลนี้"** → เปิด Modal:
  1. กรอกรหัสพนักงาน → ตรวจสอบสิทธิ์
  2. ถ้าแต้มพอ → กดยืนยัน → สร้าง log `action: "แลกรางวัล"` พร้อมหัก `point`
  3. สำเร็จ → แสดงปุ่ม **"แจ้งรับรางวัลผ่าน Line"** (redirect ไป LINE)

#### 📝 SalesLogForm (บันทึกยอดขาย)
- เปิดเป็น **Modal** จาก Navbar
- กรอก: รหัสพนักงาน (5 หลัก), เลือกสาขา, วันที่ (auto), เวลา (auto), ยอดขาย
- **Logic การให้คะแนน:**
  - ถ้า `ยอดขาย > avg_target ของสาขา` → ได้ **1 คะแนน**
  - ถ้าไม่ถึงเป้า → ได้ **0 คะแนน**
- สร้าง log `action: "ขาย"` พร้อมบันทึก sales, target, point
- จำกัดบันทึก **วันละ 1 ครั้ง ต่อรหัสพนักงาน** (ควบคุมจาก Backend)

### 4.2 LoginPage (`/login`)

- รองรับทั้ง **เข้าสู่ระบบ** และ **ลงทะเบียน**
- **เข้าสู่ระบบ:** ใส่รหัสพนักงาน + รหัสผ่าน
  - ถ้าเป็น admin → redirect ไป `/dashboard`
  - ถ้าเป็น user → redirect ไป `/`
- **ลงทะเบียน:** กรอก รหัสพนักงาน, ชื่อเล่น, ตำแหน่ง, หน่วยงาน, เลือก role
  - ถ้าเลือก role `admin` → ต้องตั้งรหัสผ่าน
  - ถ้าเลือก role `user` → ไม่ต้องตั้งรหัสผ่าน

---

## 5. หน้า Admin Dashboard

เข้าถึงได้เฉพาะ **Admin** ผ่าน `/dashboard/*` — มี Sidebar Navigation แบ่งเป็น 5 ส่วนหลัก:

### 5.1 🏢 Branches (จัดการสาขา)

จัดการข้อมูลสาขาทั้งหมดของร้าน:

| ฟีเจอร์ | รายละเอียด |
|---|---|
| ดูรายการ | ตารางแสดง: รหัส, ชื่อ, เดือน, จำนวนวัน, เป้าหมายรวม, เฉลี่ยต่อวัน, สถานะ |
| ค้นหา | ค้นหาด้วยรหัสหรือชื่อสาขา (client-side filter) |
| เพิ่มสาขา | Modal: รหัสสาขา, ชื่อ, เดือน (1-12), จำนวนวัน, เป้าหมายรวม, สถานะ |
| แก้ไข | แก้ไขข้อมูลสาขา ผ่าน Modal เดียวกัน |
| ลบ | ลบสาขา (มี confirm dialog) |
| สลับสถานะ | เปิด/ปิดใช้งาน (active/inactive) คลิกได้เลย |
| คำนวณอัตโนมัติ | `เฉลี่ยต่อวัน = เป้าหมายรวม ÷ จำนวนวัน` |

**ข้อมูลที่สำคัญ:**
- `avg_target` = เป้าหมายรายวัน — ใช้เปรียบเทียบกับยอดขายพนักงานเพื่อให้คะแนน
- `month` / `day` = ช่วงเวลาที่กำหนดให้สาขานี้

### 5.2 🎁 Rewards (จัดการของรางวัล)

| ฟีเจอร์ | รายละเอียด |
|---|---|
| ดูรายการ | ตาราง: ชื่อรางวัล, แต้มที่ต้องใช้ |
| เพิ่มรางวัล | ชื่อรางวัล + จำนวนแต้มที่ต้องใช้แลก |
| แก้ไข | แก้ไขชื่อ / จำนวนแต้ม |
| ลบ | ลบรางวัล (มี confirm) |

### 5.3 👥 Employees (จัดการพนักงาน)

ส่วนที่ซับซ้อนที่สุด ประกอบด้วย 3 ระบบย่อย:

#### A) ตารางพนักงาน (CRUD)

| ฟีเจอร์ | รายละเอียด |
|---|---|
| ดูรายการ | ID, รหัส, ชื่อเล่น, ตำแหน่ง/หน่วยงาน, แต้มสะสม, แต้มคงเหลือ, บทบาท, สถานะ |
| ค้นหา | ค้นหาด้วยรหัสหรือชื่อเล่น (server-side search) |
| เพิ่ม | รหัสพนักงาน, ชื่อ, ตำแหน่ง, หน่วยงาน, สถานะ |
| แก้ไข | แก้ไขข้อมูล (รหัสพนักงานไม่สามารถแก้ได้) |
| ลบ | ลบพนักงาน (มี confirm, ไม่สามารถเรียกคืนได้) |
| สลับสถานะ | เปิด/ปิดใช้งาน |
| Pagination | แบ่งหน้า 10 รายการ (server-side) |

#### B) ระบบเพิ่มแต้มคะแนน ⭐

1. ค้นหาพนักงานด้วยรหัส
2. แสดงข้อมูล: แต้มสะสม, ใช้ไป, คงเหลือ
3. กรอกจำนวนแต้ม + หมายเหตุ
4. กด **"เพิ่มแต้ม"** → อัปเดต `point_earned` + `point_redeemed` + สร้าง log
5. กด **"ล้าง"** → รีเซ็ตแต้มของพนักงานคนนั้นเป็น 0

#### C) ระบบหักแต้มพนักงาน 🚨

1. ค้นหาพนักงานด้วยรหัส
2. เลือกเหตุผลการหัก:
   - **ใบเตือน** → หัก **-20 แต้ม**
   - **ยอดไม่ถึง 80% ของเป้า** → หัก **-5 แต้ม**
3. ยืนยัน → อัปเดต `point_redeemed` + สร้าง log `action: "หักคะแนน"`

### 5.4 📋 Logs (บันทึกกิจกรรม)

| ฟีเจอร์ | รายละเอียด |
|---|---|
| ดูรายการ | ตาราง: ID, กิจกรรม, พนักงาน, สาขา, รายละเอียด, แต้ม, วันเวลา |
| ค้นหา | ค้นหาด้วยรหัสพนักงาน (server-side) |
| กรองกิจกรรม | ทั้งหมด / ขาย / แลกรางวัล / หักคะแนน / เพิ่มคะแนน |
| Export Excel | เลือกเดือน+ปี → ดาวน์โหลดไฟล์ `.xlsx` ด้วย SheetJS |
| Pagination | แบ่งหน้า 10 รายการ (server-side) |

**ประเภทกิจกรรม (Action Types):**

| Action | สี Badge | คำอธิบาย |
|---|---|---|
| `ขาย` | 🟢 เขียว | พนักงานบันทึกยอดขายประจำวัน |
| `แลกรางวัล` | 🔵 น้ำเงิน | พนักงานใช้แต้มแลกรางวัล |
| `เพิ่มคะแนน` | 🟢 เขียว | Admin เพิ่มแต้มให้พนักงาน |
| `หักคะแนน` | 🔴 แดง | Admin หักแต้มพนักงาน |

### 5.5 🎯 Hit Target Check (ตรวจสอบยอดขาย)

ระบบอัปโหลดไฟล์ Excel เพื่อตรวจสอบสาขาที่ทำยอดผ่านเป้าและให้คะแนนพนักงานแบบ Bulk:

**ขั้นตอนการทำงาน:**

1. **อัปโหลดไฟล์ 2 ไฟล์:**
   - ไฟล์ยอดขาย (ต้องมีคอลัมน์ `store`, `actual`)
   - ไฟล์เวลาทำงาน (ต้องมีคอลัมน์ `EmpCardNo`, `LocationName`)

2. **กดตรวจสอบ → ประมวลผล:**
   - ดึงข้อมูลสาขาจาก API
   - เปรียบเทียบ `actual` กับ `avg_target` ของแต่ละสาขา
   - ถ้า `actual ≥ avg_target` → สาขานั้น **Hit Target**
   - จับคู่พนักงานจากไฟล์เวลาทำงานกับสาขาที่ Hit Target
   - ตัดข้อมูลซ้ำ (deduplicate) ตามคู่ `EmpCardNo + LocationName`

3. **แสดงผลลัพธ์:**
   - ตารางสาขาที่ผ่านเกณฑ์ (เกณฑ์ vs ยอดจริง)
   - ตารางพนักงานที่ได้คะแนน (จัดกลุ่มตามสาขา)

4. **เลือกวันที่ + กดบันทึก:**
   - เรียก API `POST /hq/logs/bulk-hit-target`
   - แสดงสรุป: จำนวนสำเร็จ + จำนวนที่ไม่พบรหัส/ผิดพลาด

---

## 6. ระบบ Authentication

### Flow การ Login

```
User กรอก employee_code + password
  → POST /hq/auth/login
  → ได้ { token, user }
  → เก็บใน localStorage
  → redirect ตาม role
```

### Flow การ Register

```
User กรอกข้อมูล
  → POST /hq/auth/register
  → สำเร็จ → redirect ไปหน้า Login
```

### Token Management

- เก็บ JWT Token ใน `localStorage.token`
- เก็บข้อมูล User ใน `localStorage.user` (JSON)
- **Request Interceptor:** แนบ `Authorization: Bearer <token>` ทุก request
- **Response Interceptor:**
  - Unwrap standardized response (`{ success, data, meta, message }`)
  - ถ้าได้ HTTP 401 → ลบ token + redirect ไป `/login`

### PrivateRoute Component

```jsx
// ตรวจสอบ 2 เงื่อนไข:
1. isAuthenticated → ต้อง login
2. adminOnly → ต้องเป็น admin
```

---

## 7. Service Layer & API

### API Base Configuration

- Base URL: จาก `VITE_API_URL` (environment variable)
- `withCredentials: true`
- Content-Type: `application/json`

### Service สรุป

| Service | Endpoints | Methods |
|---|---|---|
| `authService` | `/hq/auth/login`, `/register`, `/me` | login, register, fetchProfile, logout, isAdmin, getCurrentUser |
| `employeeService` | `/hq/employees/*` | getAll, getById, getByCode, getStats, create, bulkCreate, resetAllPoints, bulkAddPoints, update, delete |
| `branchService` | `/hq/branches/*` | getAll, getById, create, update, delete |
| `rewardService` | `/hq/rewards/*` | getAll, getById, create (multipart), update (multipart), delete |
| `logService` | `/hq/logs/*` | getAll, getById, create, bulkHitTarget, update, delete |

---

## 8. โครงสร้างไฟล์

```
frontend-HQ/
├── public/
│   └── images/              # รูปภาพ (favicon, coupon)
├── src/
│   ├── config/
│   │   └── api.js           # Axios instance + interceptors
│   ├── services/
│   │   ├── authService.js   # Authentication
│   │   ├── employeeService.js
│   │   ├── branchService.js
│   │   ├── rewardService.js
│   │   └── logService.js
│   ├── components/
│   │   ├── PrivateRoute.jsx # Route guard
│   │   └── layout/
│   │       └── Navbar.jsx   # Navigation bar (ซ่อนใน Dashboard)
│   ├── pages/
│   │   ├── LoginPage.jsx    # Login + Register
│   │   ├── MainPage.jsx     # หน้าหลัก (Public)
│   │   ├── MainPage/
│   │   │   └── components/
│   │   │       ├── Scoreboard.jsx    # ตารางคะแนน
│   │   │       ├── PointChecker.jsx  # เช็คแต้ม
│   │   │       ├── RewardSection.jsx # แลกรางวัล
│   │   │       └── SalesLogForm.jsx  # บันทึกยอดขาย
│   │   └── Dashboard/
│   │       ├── DashboardPage.jsx     # Layout + Sidebar
│   │       └── sections/
│   │           ├── BranchSection.jsx    # จัดการสาขา
│   │           ├── EmployeeSection.jsx  # จัดการพนักงาน + แต้ม
│   │           ├── RewardSection.jsx    # จัดการรางวัล
│   │           ├── LogSection.jsx       # บันทึกกิจกรรม
│   │           ├── HitTargetSection.jsx # ตรวจสอบยอดขาย
│   │           └── GuideSection.jsx     # คู่มือ (ปิดใช้งาน)
│   ├── App.jsx              # Routes + Layout
│   ├── main.jsx             # Entry point
│   ├── App.css
│   └── index.css
├── .env                     # VITE_API_URL
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 9. Business Logic & กฎเกณฑ์

### ระบบคะแนน (Point System)

| ฟิลด์ | ความหมาย |
|---|---|
| `point_earned` | คะแนนสะสมทั้งหมดที่เคยได้รับ |
| `point_redeemed` | คะแนนคงเหลือที่ใช้แลกได้จริง |
| ใช้ไป | `point_earned - point_redeemed` |

### การได้คะแนน

| วิธี | คะแนน | เงื่อนไข |
|---|---|---|
| บันทึกยอดขาย | +1 | ยอดขาย > avg_target ของสาขา |
| Admin เพิ่มแต้ม | +N | Admin กำหนดเอง |
| Hit Target (Bulk) | +1 ต่อสาขา | ยอดขายสาขา ≥ avg_target |

### การเสียคะแนน

| วิธี | คะแนน | เงื่อนไข |
|---|---|---|
| แลกรางวัล | -N | หัก = point_reward ของรางวัล |
| ใบเตือน | -20 | Admin ดำเนินการ |
| ยอดไม่ถึง 80% | -5 | Admin ดำเนินการ |

### Navbar Behavior

- **แสดง** ในหน้า MainPage และ LoginPage
- **ซ่อน** ในหน้า Dashboard (`/dashboard/*`)

### Dashboard Sidebar

- จำ section ล่าสุดที่เลือกไว้ใน localStorage
- Responsive: บน mobile เป็น overlay, บน desktop เป็น sticky sidebar
- แสดงชื่อ user + ปุ่ม logout ด้านล่าง

---

> **หมายเหตุ:** เอกสารนี้สร้างจากการวิเคราะห์ source code โดยตรง อาจมีฟีเจอร์บางส่วนที่ถูก comment out (เช่น SalesLogForm button, Guide section, Reset All Points) ซึ่งอาจเปิดใช้งานในอนาคต
