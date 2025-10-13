# NAIROBI VERIFIED
## System Architecture Diagram Document

**For:** Kenya Copyright Board (KECOBO) Registration  
**Author:** Joseph Mwangi  
**Company:** Sikos Marketing  
**Date:** October 13, 2025

---

## 1. OVERALL SYSTEM ARCHITECTURE

```
┌─────────────────── NAIROBI VERIFIED PLATFORM ───────────────────┐
│                                                                  │
│  ┌─────────────── PRESENTATION LAYER ──────────────────┐        │
│  │                                                      │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │        │
│  │  │   CUSTOMER   │  │   MERCHANT   │  │    ADMIN    │ │        │
│  │  │   FRONTEND   │  │   DASHBOARD  │  │    PANEL    │ │        │
│  │  │              │  │              │  │             │ │        │
│  │  │ React/Vite   │  │ React/TS     │  │ React/TS    │ │        │
│  │  │ TailwindCSS  │  │ Radix UI     │  │ Radix UI    │ │        │
│  │  │ TanStack     │  │ TanStack     │  │ TanStack    │ │        │
│  │  │ Query        │  │ Query        │  │ Query       │ │        │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │        │
│  └──────────────────────────────────────────────────────┘        │
│                           │                                       │
│               ┌───────────┴────────────┐                         │
│               │                        │                         │
│               ▼                        ▼                         │
│  ┌─────────────── BUSINESS LOGIC LAYER ──────────────────┐       │
│  │                                                        │       │
│  │  ┌─────────────────── API GATEWAY ───────────────────┐ │       │
│  │  │                                                   │ │       │
│  │  │         Express.js RESTful API Server            │ │       │
│  │  │                                                   │ │       │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │       │
│  │  │  │  Auth   │ │Merchant │ │ Admin   │ │ Public  │ │ │       │
│  │  │  │Services │ │Services │ │Services │ │Services │ │ │       │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │ │       │
│  │  └───────────────────────────────────────────────────┘ │       │
│  │                                                        │       │
│  │  ┌─────────────── MIDDLEWARE LAYER ──────────────────┐ │       │
│  │  │                                                   │ │       │
│  │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │       │
│  │  │ │ Security│ │  Rate   │ │  File   │ │ Error   │ │ │       │
│  │  │ │ (Helmet)│ │Limiting │ │Upload   │ │Handling │ │ │       │
│  │  │ │  & CORS │ │         │ │(Multer) │ │         │ │ │       │
│  │  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │ │       │
│  │  └───────────────────────────────────────────────────┘ │       │
│  └────────────────────────────────────────────────────────┘       │
│                           │                                       │
│               ┌───────────┴────────────┐                         │
│               │                        │                         │
│               ▼                        ▼                         │
│  ┌─────────────── DATA PERSISTENCE LAYER ───────────────┐        │
│  │                                                       │        │
│  │  ┌──────────────┐              ┌──────────────┐      │        │
│  │  │ PostgreSQL   │              │   File       │      │        │
│  │  │   Database   │              │   Storage    │      │        │
│  │  │              │              │   System     │      │        │
│  │  │ ┌──────────┐ │              │              │      │        │
│  │  │ │Sequelize │ │              │ ┌──────────┐ │      │        │
│  │  │ │   ORM    │ │              │ │Documents │ │      │        │
│  │  │ └──────────┘ │              │ │ & Images │ │      │        │
│  │  └──────────────┘              │ └──────────┘ │      │        │
│  │                                └──────────────┘      │        │
│  └───────────────────────────────────────────────────────┘        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. DATA FLOW ARCHITECTURE

```
┌─────────────── USER INTERACTIONS & DATA FLOW ────────────────┐
│                                                              │
│  ┌──────────┐     HTTPS/API     ┌─────────────────────────┐  │
│  │   USER   │ ────────────────► │      API GATEWAY       │  │
│  │ FRONTEND │ ◄──────────────── │    (Express.js)        │  │
│  └──────────┘     JSON/JWT      └─────────────────────────┘  │
│                                              │               │
│                                              │               │
│                                              ▼               │
│  ┌─────────────────────── SERVICE LAYER ──────────────────┐  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │ Authentication│ │  Business   │  │   Admin     │   │  │
│  │  │   Service     │ │ Verification│ │  Management │   │  │
│  │  │               │ │   Service   │ │   Service   │   │  │
│  │  │ ┌───────────┐ │ │             │ │             │   │  │
│  │  │ │JWT/Passport│ │ │ ┌─────────┐ │ │ ┌─────────┐ │   │  │
│  │  │ │Google OAuth│ │ │ │Document │ │ │ │Analytics│ │   │  │
│  │  │ └───────────┘ │ │ │Processing│ │ │ │& Reports│ │   │  │
│  │  └─────────────┘ │ │ └─────────┘ │ │ └─────────┘ │   │  │
│  │                   │ └─────────────┘ └─────────────┘   │  │
│  │                   │                                   │  │
│  │  ┌─────────────┐  │  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │   Order     │  │  │   Payment   │  │ Notification│ │  │
│  │  │ Management  │  │  │ Processing  │  │   Service   │ │  │
│  │  │             │  │  │             │  │             │ │  │
│  │  │ ┌─────────┐ │  │  │ ┌─────────┐ │  │ ┌─────────┐ │ │  │
│  │  │ │Shopping │ │  │  │ │DPO Group│ │  │ │ Email   │ │ │  │
│  │  │ │Cart     │ │  │  │ │M-Pesa   │ │  │ │ SMS     │ │ │  │
│  │  │ └─────────┘ │  │  │ └─────────┘ │  │ └─────────┘ │ │  │
│  │  └─────────────┘  │  └─────────────┘  └─────────────┘ │  │
│  └────────────────────┴─────────────────────────────────────┘  │
│                                              │                 │
│                                              ▼                 │
│  ┌─────────────── DATABASE & STORAGE ────────────────────┐     │
│  │                                                       │     │
│  │  ┌──────────────┐              ┌──────────────┐      │     │
│  │  │ PostgreSQL   │              │ File Storage │      │     │
│  │  │              │              │              │      │     │
│  │  │ ┌──────────┐ │  Read/Write  │ ┌──────────┐ │      │     │
│  │  │ │ Users    │ │ ◄──────────► │ │Documents │ │      │     │
│  │  │ │ Merchants│ │              │ │ Images   │ │      │     │
│  │  │ │ Products │ │              │ │ Uploads  │ │      │     │
│  │  │ │ Orders   │ │              │ └──────────┘ │      │     │
│  │  │ │ Reviews  │ │              └──────────────┘      │     │
│  │  │ └──────────┘ │                                    │     │
│  │  └──────────────┘                                    │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. DATABASE ENTITY RELATIONSHIP DIAGRAM

```
┌──────────────── POSTGRESQL DATABASE SCHEMA ─────────────────┐
│                                                             │
│  ┌─────────────┐              ┌─────────────┐              │
│  │ AdminUserPG │              │   UserPG    │              │
│  ├─────────────┤              ├─────────────┤              │
│  │ id (UUID)   │              │ id (UUID)   │              │
│  │ username    │              │ name        │              │
│  │ email       │              │ email       │              │
│  │ password    │              │ password    │              │
│  │ role        │              │ phone       │              │
│  │ isActive    │              │ isActive    │              │
│  │ createdAt   │              │ createdAt   │              │
│  │ updatedAt   │              │ updatedAt   │              │
│  └─────────────┘              └─────────────┘              │
│                                       │                    │
│                                       │                    │
│  ┌─────────────┐              ┌───────▼─────┐              │
│  │ MerchantPG  │              │   OrderPG   │              │
│  ├─────────────┤              ├─────────────┤              │
│  │ id (UUID)   │◄─────────────┤ merchantId  │              │
│  │ businessName│              │ userId      │◄─────────────┤
│  │ email       │              │ totalAmount │              │
│  │ password    │              │ status      │              │
│  │ phone       │              │ items(JSONB)│              │
│  │ businessType│              │ paymentId   │              │
│  │ address     │              │ createdAt   │              │
│  │ verified    │              │ updatedAt   │              │
│  │ documents   │              └─────────────┘              │
│  │ createdAt   │                      │                   │
│  │ updatedAt   │                      │                   │
│  └──────┬──────┘              ┌───────▼─────┐              │
│         │                     │  ReviewPG   │              │
│         │                     ├─────────────┤              │
│         │                     │ id (UUID)   │              │
│         └─────────────────────►│ merchantId  │              │
│                               │ userId      │◄─────────────┤
│  ┌─────────────┐              │ rating      │              │
│  │ ProductPG   │              │ comment     │              │
│  ├─────────────┤              │ createdAt   │              │
│  │ id (UUID)   │              │ updatedAt   │              │
│  │ merchantId  │◄─────────────┤ └─────────────┘              │
│  │ name        │                                           │
│  │ description │              ┌─────────────┐              │
│  │ price       │              │   CartPG    │              │
│  │ category    │              ├─────────────┤              │
│  │ images      │              │ id (UUID)   │              │
│  │ inStock     │              │ userId      │◄─────────────┤
│  │ createdAt   │              │ items(JSONB)│              │
│  │ updatedAt   │              │ createdAt   │              │
│  └─────────────┘              │ updatedAt   │              │
│                               └─────────────┘              │
│  ┌─────────────┐                                          │
│  │ FlashSalePG │                                          │
│  ├─────────────┤              ┌─────────────┐              │
│  │ id (UUID)   │              │ DocumentPG  │              │
│  │ merchantId  │◄─────────────┤ ├─────────────┤              │
│  │ title       │              │ id (UUID)   │              │
│  │ description │              │ merchantId  │◄─────────────┤
│  │ startDate   │              │ type        │              │
│  │ endDate     │              │ filename    │              │
│  │ discount    │              │ filepath    │              │
│  │ products    │              │ status      │              │
│  │ (JSONB)     │              │ uploadedAt  │              │
│  │ isActive    │              │ reviewedAt  │              │
│  │ createdAt   │              └─────────────┘              │
│  │ updatedAt   │                                          │
│  └─────────────┘                                          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 4. AUTHENTICATION & AUTHORIZATION FLOW

```
┌──────────────── SECURITY ARCHITECTURE ────────────────┐
│                                                       │
│  ┌─────────────┐                 ┌─────────────┐     │
│  │   CLIENT    │                 │   SERVER    │     │
│  │ (Frontend)  │                 │ (Backend)   │     │
│  └──────┬──────┘                 └──────┬──────┘     │
│         │                               │            │
│         │ 1. Login Request              │            │
│         ├─────────────────────────────► │            │
│         │   (email, password)           │            │
│         │                               │            │
│         │                        ┌──────▼──────┐    │
│         │                        │ Validate    │    │
│         │                        │ Credentials │    │
│         │                        └──────┬──────┘    │
│         │                               │            │
│         │                        ┌──────▼──────┐    │
│         │                        │ Generate    │    │
│         │                        │ JWT Token   │    │
│         │                        └──────┬──────┘    │
│         │                               │            │
│         │ 2. JWT Token Response         │            │
│         │◄─────────────────────────────┤            │
│         │                               │            │
│  ┌──────▼──────┐                       │            │
│  │ Store Token │                       │            │
│  │ in Memory/  │                       │            │
│  │ LocalStorage│                       │            │
│  └──────┬──────┘                       │            │
│         │                               │            │
│         │ 3. API Requests with Token    │            │
│         ├─────────────────────────────► │            │
│         │   Authorization: Bearer <JWT> │            │
│         │                               │            │
│         │                        ┌──────▼──────┐    │
│         │                        │ Verify JWT  │    │
│         │                        │ & Extract   │    │
│         │                        │ User Info   │    │
│         │                        └──────┬──────┘    │
│         │                               │            │
│         │                        ┌──────▼──────┐    │
│         │                        │ Authorize   │    │
│         │                        │ Based on    │    │
│         │                        │ User Role   │    │
│         │                        └──────┬──────┘    │
│         │                               │            │
│         │ 4. API Response               │            │
│         │◄─────────────────────────────┤            │
│         │                               │            │
└─────────┴───────────────────────────────┴────────────┘

ROLE-BASED ACCESS CONTROL:

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   CUSTOMER      │ │   MERCHANT      │ │     ADMIN       │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • View Businesses│ │ • Manage Profile│ │ • Verify Business│
│ • Place Orders   │ │ • Add Products  │ │ • Manage Users  │
│ • Write Reviews  │ │ • View Orders   │ │ • System Config │
│ • Manage Cart    │ │ • Update Info   │ │ • View Analytics│
│ • View History   │ │ • Upload Docs   │ │ • Moderate Content│
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 5. VERIFICATION PROCESS FLOW

```
┌─────────────── BUSINESS VERIFICATION WORKFLOW ───────────────┐
│                                                              │
│  ┌──────────────┐                                           │
│  │   BUSINESS   │                                           │
│  │ REGISTRATION │                                           │
│  └───────┬──────┘                                           │
│          │                                                  │
│          ▼                                                  │
│  ┌──────────────┐     ┌─────────────────────────────────┐   │
│  │   DOCUMENT   │ ──► │      REQUIRED DOCUMENTS         │   │
│  │   UPLOAD     │     │                                 │   │
│  └──────┬───────┘     │ • Business Registration Cert   │   │
│         │             │ • National ID/Passport          │   │
│         │             │ • Utility Bill/Address Proof    │   │
│         │             │ • Business Permits (Optional)   │   │
│         │             └─────────────────────────────────┘   │
│         ▼                                                   │
│  ┌──────────────┐     ┌─────────────────────────────────┐   │
│  │ AUTOMATED    │ ──► │     VALIDATION CHECKS          │   │
│  │ VALIDATION   │     │                                 │   │
│  └──────┬───────┘     │ • File Format Verification     │   │
│         │             │ • Document Size Validation      │   │
│         │             │ • Metadata Extraction          │   │
│         │             │ • Virus Scanning               │   │
│         │             └─────────────────────────────────┘   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   ADMIN      │     ┌─────────────────────────────────┐   │
│  │   REVIEW     │ ──► │      MANUAL VERIFICATION       │   │
│  │   QUEUE      │     │                                 │   │
│  └──────┬───────┘     │ • Document Authenticity Check  │   │
│         │             │ • Business Legitimacy Verify   │   │
│         │             │ • Cross-Reference Databases    │   │
│         │             │ • Background Verification      │   │
│         │             └─────────────────────────────────┘   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │  DECISION    │                                          │
│  │   POINT      │                                          │
│  └──────┬───────┘                                          │
│         │                                                  │
│    ┌────┴────┐                                            │
│    │         │                                            │
│    ▼         ▼                                            │
│ ┌─────────┐ ┌─────────┐                                   │
│ │APPROVED │ │REJECTED │                                   │
│ └────┬────┘ └────┬────┘                                   │
│      │           │                                        │
│      ▼           ▼                                        │
│ ┌─────────┐ ┌─────────┐                                   │
│ │VERIFIED │ │RE-SUBMIT│                                   │
│ │ BADGE   │ │REQUEST  │                                   │
│ │ASSIGNED │ │  SENT   │                                   │
│ └─────────┘ └─────────┘                                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 6. PAYMENT PROCESSING ARCHITECTURE

```
┌─────────────── PAYMENT INTEGRATION FLOW ────────────────┐
│                                                         │
│  ┌──────────┐                    ┌──────────────────┐   │
│  │CUSTOMER  │                    │   NAIROBI        │   │
│  │FRONTEND  │                    │   VERIFIED       │   │
│  └────┬─────┘                    │   BACKEND        │   │
│       │                          └─────────┬────────┘   │
│       │ 1. Initiate Payment              │            │
│       ├─────────────────────────────────►│            │
│       │                                   │            │
│       │                            ┌──────▼──────┐     │
│       │                            │   Payment   │     │
│       │                            │ Validation  │     │
│       │                            └──────┬──────┘     │
│       │                                   │            │
│       │                            ┌──────▼──────┐     │
│       │                            │  DPO GROUP  │     │
│       │                            │  PAYMENT    │     │
│       │                            │  GATEWAY    │     │
│       │                            └──────┬──────┘     │
│       │                                   │            │
│       │ 2. Payment Form/Redirect          │            │
│       │◄─────────────────────────────────┤            │
│       │                                   │            │
│  ┌────▼─────┐                           │            │
│  │ PAYMENT  │                           │            │
│  │ METHODS  │                           │            │
│  │          │                           │            │
│  │ ┌──────┐ │          ┌─────────────────▼─────────┐  │
│  │ │Credit│ ├─────────►│     PAYMENT PROCESSING    │  │
│  │ │ Card │ │          │                           │  │
│  │ └──────┘ │          │  ┌─────────┐ ┌─────────┐  │  │
│  │          │          │  │ M-PESA  │ │ AIRTEL  │  │  │
│  │ ┌──────┐ │          │  │         │ │ MONEY   │  │  │
│  │ │M-PESA│ ├─────────►│  └─────────┘ └─────────┘  │  │
│  │ │      │ │          │                           │  │
│  │ └──────┘ │          │  ┌─────────┐ ┌─────────┐  │  │
│  │          │          │  │  VISA   │ │MASTERCARD│  │  │
│  │ ┌──────┐ │          │  │         │ │         │  │  │
│  │ │Airtel│ ├─────────►│  └─────────┘ └─────────┘  │  │
│  │ │Money │ │          └─────────────────┬─────────┘  │
│  │ └──────┘ │                           │            │
│  └──────────┘                           │            │
│       │                                 │            │
│       │ 3. Payment Confirmation         │            │
│       │◄───────────────────────────────┤            │
│       │                                 │            │
│       │                          ┌──────▼──────┐     │
│       │                          │   Update    │     │
│       │                          │   Order     │     │
│       │                          │   Status    │     │
│       │                          └──────┬──────┘     │
│       │                                 │            │
│       │ 4. Order Confirmation           │            │
│       │◄───────────────────────────────┤            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 7. FILE UPLOAD AND STORAGE ARCHITECTURE

```
┌────────────── DOCUMENT MANAGEMENT SYSTEM ──────────────┐
│                                                        │
│  ┌──────────────┐              ┌──────────────────┐    │
│  │   MERCHANT   │              │   FILE UPLOAD    │    │
│  │   FRONTEND   │              │   MIDDLEWARE     │    │
│  └──────┬───────┘              │    (Multer)      │    │
│         │                      └─────────┬────────┘    │
│         │ Upload Documents              │             │
│         ├──────────────────────────────►│             │
│         │                               │             │
│         │                        ┌──────▼──────┐      │
│         │                        │ File Size & │      │
│         │                        │Type Validate│      │
│         │                        └──────┬──────┘      │
│         │                               │             │
│         │                        ┌──────▼──────┐      │
│         │                        │   Virus     │      │
│         │                        │  Scanning   │      │
│         │                        └──────┬──────┘      │
│         │                               │             │
│         │                        ┌──────▼──────┐      │
│         │                        │ Generate    │      │
│         │                        │ Unique ID & │      │
│         │                        │ File Path   │      │
│         │                        └──────┬──────┘      │
│         │                               │             │
│         │                      ┌────────▼────────┐    │
│         │                      │  SECURE FILE    │    │
│         │                      │     STORAGE     │    │
│         │                      │                 │    │
│         │                      │ ┌─────────────┐ │    │
│         │                      │ │ BUSINESS    │ │    │
│         │                      │ │REGISTRATION │ │    │
│         │                      │ └─────────────┘ │    │
│         │                      │                 │    │
│         │                      │ ┌─────────────┐ │    │
│         │                      │ │    ID       │ │    │
│         │                      │ │ DOCUMENTS   │ │    │
│         │                      │ └─────────────┘ │    │
│         │                      │                 │    │
│         │                      │ ┌─────────────┐ │    │
│         │                      │ │ UTILITY     │ │    │
│         │                      │ │   BILLS     │ │    │
│         │                      │ └─────────────┘ │    │
│         │                      │                 │    │
│         │                      │ ┌─────────────┐ │    │
│         │                      │ │ ADDITIONAL  │ │    │
│         │                      │ │ DOCUMENTS   │ │    │
│         │                      │ └─────────────┘ │    │
│         │                      └─────────────────┘    │
│         │                               │             │
│         │                        ┌──────▼──────┐      │
│         │                        │   Update    │      │
│         │                        │  Database   │      │
│         │                        │  Metadata   │      │
│         │                        └──────┬──────┘      │
│         │                               │             │
│         │ Upload Confirmation           │             │
│         │◄─────────────────────────────┤             │
│                                                      │
└──────────────────────────────────────────────────────┘

FILE SECURITY MEASURES:
┌────────────────────────────────────────────────┐
│ • Encrypted file storage                       │
│ • Access control and permissions               │
│ • Unique file naming to prevent conflicts      │
│ • File type validation and restrictions        │
│ • Virus scanning before storage               │
│ • Secure download with authentication         │
│ • Audit trail for file access                 │
│ • Automated backup and recovery               │
└────────────────────────────────────────────────┘
```

---

## 8. NOTIFICATION SYSTEM ARCHITECTURE

```
┌─────────────── NOTIFICATION SYSTEM ──────────────────┐
│                                                      │
│  ┌─────────────┐              ┌─────────────────┐    │
│  │   EVENT     │              │   NOTIFICATION  │    │
│  │  TRIGGERS   │              │    PROCESSOR    │    │
│  └──────┬──────┘              └─────────┬───────┘    │
│         │                               │            │
│         ▼                               ▼            │
│  ┌─────────────┐              ┌─────────────────┐    │
│  │ • New Order │              │   NOTIFICATION  │    │
│  │ • Verified  ├─────────────►│   DISPATCHER    │    │
│  │ • Rejected  │              └─────────┬───────┘    │
│  │ • Payment   │                        │            │
│  │ • Messages  │                        ▼            │
│  └─────────────┘              ┌─────────────────┐    │
│                               │   DELIVERY      │    │
│                               │   CHANNELS      │    │
│                               └─────────┬───────┘    │
│                                         │            │
│                    ┌────────────────────┼────────────┐
│                    │                    │            │
│                    ▼                    ▼            ▼
│         ┌─────────────────┐   ┌─────────────┐ ┌─────────────┐
│         │     EMAIL       │   │     SMS     │ │ IN-APP      │
│         │  NOTIFICATIONS  │   │NOTIFICATIONS│ │NOTIFICATIONS│
│         │                 │   │             │ │             │
│         │ ┌─────────────┐ │   │ ┌─────────┐ │ │ ┌─────────┐ │
│         │ │ Welcome     │ │   │ │ Order   │ │ │ │ Real-   │ │
│         │ │ Emails      │ │   │ │ Updates │ │ │ │ Time    │ │
│         │ └─────────────┘ │   │ └─────────┘ │ │ │ Alerts  │ │
│         │                 │   │             │ │ └─────────┘ │
│         │ ┌─────────────┐ │   │ ┌─────────┐ │ │             │
│         │ │Verification │ │   │ │Security │ │ │ ┌─────────┐ │
│         │ │ Status      │ │   │ │ Codes   │ │ │ │ Badge   │ │
│         │ └─────────────┘ │   │ └─────────┘ │ │ │ Updates │ │
│         └─────────────────┘   └─────────────┘ │ └─────────┘ │
│                                               └─────────────┘
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. DEPLOYMENT ARCHITECTURE

```
┌─────────────── PRODUCTION DEPLOYMENT ────────────────┐
│                                                      │
│  ┌─────────────────────── LOAD BALANCER ──────────── │
│  │                                                 │ │
│  │              ┌──────────────────┐               │ │
│  │              │   HTTPS/SSL      │               │ │
│  │              │   TERMINATION    │               │ │
│  │              └─────────┬────────┘               │ │
│  └──────────────────────┬─┴──────────────────────── │
│                         │                           │
│         ┌───────────────┴────────────────┐          │
│         │                                │          │
│         ▼                                ▼          │
│  ┌─────────────┐                  ┌─────────────┐   │
│  │  FRONTEND   │                  │  FRONTEND   │   │
│  │  SERVER 1   │                  │  SERVER 2   │   │
│  │             │                  │             │   │
│  │ ┌─────────┐ │                  │ ┌─────────┐ │   │
│  │ │React App│ │                  │ │React App│ │   │
│  │ │Build    │ │                  │ │Build    │ │   │
│  │ └─────────┘ │                  │ └─────────┘ │   │
│  └─────────────┘                  └─────────────┘   │
│         │                                │          │
│         └───────────────┬────────────────┘          │
│                         │                           │
│                         ▼                           │
│  ┌──────────────────────────────────────────────┐   │
│  │            API GATEWAY                       │   │
│  └─────────────────────┬────────────────────────┘   │
│                        │                            │
│         ┌──────────────┴───────────────┐            │
│         │                              │            │
│         ▼                              ▼            │
│  ┌─────────────┐                ┌─────────────┐     │
│  │  BACKEND    │                │  BACKEND    │     │
│  │  SERVER 1   │                │  SERVER 2   │     │
│  │             │                │             │     │
│  │ ┌─────────┐ │                │ ┌─────────┐ │     │
│  │ │Node.js  │ │                │ │Node.js  │ │     │
│  │ │Express  │ │                │ │Express  │ │     │
│  │ └─────────┘ │                │ └─────────┘ │     │
│  └─────────────┘                └─────────────┘     │
│         │                              │            │
│         └──────────────┬───────────────┘            │
│                        │                            │
│                        ▼                            │
│  ┌──────────────────────────────────────────────┐   │
│  │            DATABASE CLUSTER                  │   │
│  │                                              │   │
│  │  ┌─────────────┐          ┌─────────────┐   │   │
│  │  │ PostgreSQL  │          │ PostgreSQL  │   │   │
│  │  │  PRIMARY    │◄────────►│  REPLICA    │   │   │
│  │  │             │          │             │   │   │
│  │  └─────────────┘          └─────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │             FILE STORAGE                     │   │
│  │                                              │   │
│  │  ┌─────────────┐          ┌─────────────┐   │   │
│  │  │  DOCUMENT   │          │   BACKUP    │   │   │
│  │  │  STORAGE    │◄────────►│  STORAGE    │   │   │
│  │  │             │          │             │   │   │
│  │  └─────────────┘          └─────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 10. CONCLUSION

This comprehensive system architecture demonstrates the sophisticated, multi-layered design of the Nairobi Verified platform. The architecture incorporates:

### **Technical Sophistication:**
- Modern, scalable three-tier architecture
- Microservices-ready design with clear separation of concerns  
- Robust security implementation at all layers
- Performance optimization through caching and load balancing
- Comprehensive error handling and monitoring

### **Business Innovation:**
- Unique verification workflow addressing real market needs
- Multi-stakeholder platform design (customers, merchants, admins)
- Integration with local payment systems and services
- Scalable document management and processing system
- Real-time notification and communication systems

### **Security and Compliance:**
- End-to-end encryption for sensitive data
- Role-based access control with JWT authentication
- Secure file upload and storage with virus scanning
- PCI DSS compliant payment processing
- Comprehensive audit trails and monitoring

### **Scalability and Performance:**
- Horizontal scaling capabilities
- Database optimization with proper indexing
- CDN integration for global performance
- Caching strategies for improved response times
- Load balancing for high availability

This architectural design represents significant intellectual property, demonstrating original thinking, technical expertise, and innovative solutions to complex business problems. The comprehensive nature of the system architecture supports its registration and protection under copyright law as an original software work.

---

**This system architecture document establishes the technical complexity and innovative design of the Nairobi Verified platform, supporting its copyright registration as a sophisticated software system.**