# 🛡️ Threat Visualization Dashboard

A secure, modular fullstack application built with React, Node.js, Express, and GraphQL. It visualizes cybersecurity events such as blocked IPs, WAF triggers, DDoS incidents, and rule management. Authentication is handled via REST API with JWT tokens and role-based access control.

---

## 🚀 Features

- JWT-based login with 60-minute inactivity logout
- Role-based access control (admin/viewer)
- GraphQL queries and mutations for dynamic data handling
- REST login with input validation and sanitization
- Modular React frontend with Vite
- Express backend with GraphQL schema and resolvers
- Visual dashboards for blocked IPs, WAF triggers, DDoS events, and rule management

---

## 📦 Tech Stack

| Layer     | Technology            |
|-----------|------------------------|
| Frontend  | React, Vite, JWT       |
| Backend   | Node.js, Express, GraphQL |
| Auth      | REST API + JWT         |
| Storage   | localStorage (token)   |
| Security  | express-validator, input sanitization, token expiry |

---

## 🧱 Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (React + Vite Application)                │
│                        Port: 5173                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌────────────┐    ┌──────────────┐         │
│  │  Login   │───▶│    App     │───▶│  Dashboard   │         │
│  │Component │    │ Component  │    │  Component   │         │
│  └──────────┘    └────────────┘    └──────────────┘         │
│                                            │                │
│                                            ▼                │
│                    ┌────────────────────────────┐           │
│                    │  Child Components:         │           │
│                    │  - BlockedIPs              │           │
│                    │  - WAFTriggers             │           │
│                    │  - DDoSEvents              │           │
│                    │  - RuleManagement          │           │
│                    └────────────────────────────┘           │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│                (Node.js + Express + GraphQL)                │
│                        Port: 4000                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  REST Endpoint:                                             │
│  POST /login  ──────▶ JWT Token Generation                 │
│                                                             │
│  GraphQL Endpoint:                                          │
│  POST /graphql ──────▶ Query/Mutation Processing            |
│                                                             │
│  ┌──────────────────────────────────────────┐               │
│  │  GraphQL Schema:                         │               │
│  │  - Queries (Read Operations)             │               │
│  │  - Mutations (Write Operations)          │               │
│  │  - Resolvers (Business Logic)            │               │
│  └──────────────────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

---

## 🔐 Authentication Flow (REST API)

- User submits credentials via `/login`
- Backend validates using `express-validator` and sanitizes input
- JWT token is generated with 1-hour expiry
- Token is stored in `localStorage`
- App state updates and user is routed to Dashboard

---

## ⏳ Session Timeout Behavior

- JWT token includes a 1-hour expiration
- If the user is inactive for 60 minutes:
  - Backend rejects token
  - Frontend detects expired session
  - User is logged out and redirected to Login page

---

## 📡 GraphQL Query & Mutation Flow

- Frontend sends GraphQL request to `/graphql`
- JWT token is included in Authorization header
- Backend verifies token and extracts user role
- Resolvers enforce role-based access
- Data is returned to frontend and rendered

---

## 🧩 Component Hierarchy
```text
App.jsx (Root Component)
│
├── Login.jsx
│   └── Handles authentication via REST API
│
└── Dashboard.jsx
    ├── Sidebar Navigation
    │   ├── Blocked IPs button
    │   ├── WAF Triggers button
    │   ├── DDoS Events button
    │   ├── Rule Management button (admin only)
    │   └── Logout button
    │
    └── Main Content Area (renders one of:)
        ├── BlockedIPs.jsx
        │   └── GraphQL Query: { blockedIPs { ... } }
        │
        ├── WAFTriggers.jsx
        │   └── GraphQL Query: { wafTriggers { ... } }
        │
        ├── DDoSEvents.jsx
        │   └── GraphQL Query: { ddosEvents { ... } }
        │
        └── RuleManagement.jsx (admin only)
            └── GraphQL Mutation: mutation { addRule(...) }
```

---

## 🔄 Data Flow Diagrams

### Initial Page Load

User opens browser ↓ App.jsx checks for JWT ↓ If token exists → Dashboard ↓ Extract role → Render sidebar ↓ Load default tab → Send GraphQL query ↓ Display data

Code

### User Login Flow

User enters credentials ↓ POST /login ↓ Backend validates → Generates JWT ↓ Returns token → Store in localStorage ↓ Update App state → Render Dashboard

Code

### GraphQL Query Flow

Component mounts ↓ useEffect triggers query ↓ JWT retrieved → Sent in header ↓ Backend verifies → Executes resolver ↓ Returns data → Update state → Re-render

Code

---

## 🧪 Backend Overview (Node.js + Express)

### Key Modules Used

- `express`: Web server
- `cors`: Cross-origin support
- `jsonwebtoken`: JWT creation and verification
- `express-validator`: Input validation
- `graphql`: Schema and resolvers
- `graphql-http`: GraphQL handler for Express

🔐 Authentication & Authorization Overview
The backend exposes a /login REST endpoint that validates and sanitizes user credentials using express-validator.

On successful login, it generates a JWT token containing the username and role, signed with a secret key and set to expire in 1 hour.

The token is returned to the frontend and stored in localStorage, used for all subsequent GraphQL requests.

The GraphQL endpoint (/graphql) is handled via graphql-http, with a context function that extracts and verifies the JWT from the Authorization header.

If the token is valid, the decoded user info (including role) is passed to resolvers via context.

If verification fails or no token is provided, the user defaults to a viewer role, restricting access to admin-only mutations.

📘 Key Concepts Summary
1. Authentication (REST)
Login via /login

JWT token generated and stored

Used for all subsequent requests

2. Authorization (GraphQL)
JWT included in every request

Backend verifies and extracts role

Resolvers enforce role-based access

3. Data Fetching (Queries)
Components send GraphQL queries

Backend returns data via resolvers

UI updates with new data

4. Data Modification (Mutations)
Admin sends GraphQL mutations

Backend validates and updates data

Success/error messages shown

5. State Management
App.jsx: Auth state

Dashboard.jsx: Tab state

Child components: Data state

localStorage: Persistent token

🧪 Security Highlights
Input sanitization to prevent XSS

JWT expiration after 60 minutes

Role-based access control

No sensitive data stored on frontend

OWASP-aligned practices for session and token handling

📂 Folder Structure 
```
Code
src/
├── app/
│   ├── App.jsx                  # Root component
│   ├── Login.jsx                # Handles authentication via REST API
│   ├── Dashboard.jsx            # Main layout with sidebar and tab routing
│   ├── components/
│   │   ├── BlockedIPs.jsx       # Displays blocked IPs via GraphQL query
│   │   ├── WAFTriggers.jsx      # Shows WAF trigger rules and severity
│   │   ├── DDoSEvents.jsx       # Visualizes DDoS traffic events
│   │   └── RuleManagement.jsx   # Admin-only rule creation via GraphQL mutation
│   ├── graphql/
│   │   ├── schema.js            # GraphQL schema definitions
│   │   ├── resolvers.js         # Resolver functions for queries and mutations
│   ├── services/
│   │   └── auth.js              # Auth utilities (e.g., token handling)
│   └── utils/
│       └── graphqlRequest.js    # Helper for sending GraphQL requests
