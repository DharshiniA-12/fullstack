# Experiment 3 — Leave Management System with Separate Manager Login

A responsive full-stack Leave Management System based on Experiment 3 in the Full Stack Web Development Laboratory syllabus and the reference UI supplied. The project supports separate employee and manager sign-in experiences. Employees can apply for Casual Leave or Medical Leave and track their request status. Managers can review all requests and approve or reject pending applications with an optional note.

## Features

### Employee workspace
- Separate Employee Login and Create User options.
- Employee registration with username, email, roll number, password and initial leave balances.
- Dashboard with available Casual Leave and Medical Leave balances.
- Apply for leave with type, start date, end date and optional reason.
- Inclusive calendar-day calculation and date validation.
- Pending, Approved, Rejected and Cancelled application statuses.
- Pending requests reserve available days; the actual balance is deducted when the manager approves the request.
- Employees can cancel pending requests or withdraw approved requests. Withdrawing an approved request restores the deducted days.
- Employee application history shows manager remarks.

### Manager workspace
- Separate Manager Login tab; manager access is not available through public employee registration.
- Manager dashboard with total, pending, approved and rejected request counts.
- Filters for Pending, All, Approved, Rejected and Cancelled requests.
- View employee name, email, roll number, leave type, dates, duration and reason.
- Approve or reject pending requests.
- Optional decision note, shown to the employee in the application history.
- Server-side role checks protect manager APIs. Changing a frontend URL alone does not grant manager access.

### Technical features
- React + Vite frontend.
- Node.js + Express backend.
- MongoDB + Mongoose persistence.
- Password hashing with bcryptjs.
- JWT bearer token authentication.
- Responsive blue-and-white design inspired by the supplied Leave Management System screenshots.

## Requirements

- Node.js and npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code (recommended)

## Folder structure

```text
ex3/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── middleware/auth.js
│       ├── models/LeaveRequest.js
│       ├── models/User.js
│       ├── routes/auth.js
│       ├── routes/leaves.js
│       ├── seed.js
│       └── server.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── styles.css
```

## Run on Windows using PowerShell

Extract the project to:

`C:\Users\JOSHIKA\OneDrive\Desktop\fullstack\ex3`

### 1. Check MongoDB

```powershell
Get-Service MongoDB
```

The status should be `Running`. If it is stopped, open PowerShell as Administrator and run `Start-Service MongoDB`.

### 2. Configure and run the backend

Open the first VS Code terminal and run these commands one at a time:

```powershell
cd C:\Users\JOSHIKA\OneDrive\Desktop\fullstack\ex3\backend
Copy-Item .env.example .env
npm install
npm run seed
npm run dev
```

Run `Copy-Item .env.example .env` only the first time. Skip it if `backend/.env` already exists. The default configuration uses `mongodb://127.0.0.1:27017/leave_management`. For MongoDB Atlas, update `MONGO_URI` in `backend/.env`.

Keep the backend terminal open. Successful startup should report the API at `http://localhost:5000` and a connected MongoDB database.

### 3. Run the frontend in a second terminal

```powershell
cd C:\Users\JOSHIKA\OneDrive\Desktop\fullstack\ex3\frontend
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. Do not use Live Server for this React project. Keep both terminals running.

### 4. Demo accounts

The seed command creates these accounts if they do not already exist. Existing account data is preserved.

**Employee login**

- Email: `kamali@demo.com`
- Password: `demo12345`

**Manager login**

- Email: `manager@leaveease.com`
- Password: `manager12345`

Choose the matching tab on the login screen. The employee account cannot use the manager endpoint, and the manager account cannot use the employee login endpoint.

The demo credentials are intentionally available to anyone using the public demo. The seed command preserves the account's leave data and ensures the displayed demo password is current. Do not use the demo accounts for real employee data. Change the `JWT_SECRET` in `backend/.env` from the example value before deploying.

### 5. Test the approval workflow

1. Start MongoDB and run the backend seed command.
2. Sign in through **Employee** using the demo employee account.
3. Apply for leave for valid future dates. The request should show **Pending** and available days are reserved against further requests.
4. Log out.
5. Sign in through **Manager** using the manager demo account.
6. Open the Pending filter, review the employee request and optionally enter a decision note.
7. Click **Approve leave** or **Reject**.
8. Log out and sign back in as the employee. Refresh My applications to see the updated status and manager note.
9. On approval, the leave balance is deducted. On rejection, no balance is deducted. Cancelling a pending request releases its reserved days; withdrawing an approved request restores the deducted days.

Health check: open `http://localhost:5000/api/health`. It should return JSON showing `"status":"ok"` and `"database":"connected"`.

## Deploy to Render and GitHub Pages

The GitHub Actions workflow builds the frontend with the Render API URL and publishes it at `https://dharshinia-12.github.io/fullstack/ex3/`.

### Render backend

1. In Render, create or open the Web Service for this repository. Set **Root Directory** to `ex3/backend`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
2. In the service's **Environment** settings, set:
   - `MONGO_URI` to the MongoDB Atlas connection string for the Leave Management database.
   - `JWT_SECRET` to a long, random secret kept only in Render.
   - `CLIENT_URL` to `https://dharshinia-12.github.io` (the site origin, without `/fullstack/ex3/`).
   - `CORS_ORIGINS` to `https://dharshinia-12.github.io`. Add any other required frontend origins as a comma-separated list.
3. Save the settings and deploy. `npm start` first runs the idempotent seed: it creates the demo employee and manager when missing, and repairs only their demo passwords if needed. It does not duplicate accounts or reset leave balances. A conflicting role at a demo email stops startup with an explicit error.
4. Confirm `https://leave-management-api-hvmk.onrender.com/api/health` reports `"status":"ok"` and `"database":"connected"`.

Keep the MongoDB URI and JWT secret in Render environment settings; never put them in the frontend or GitHub Pages build variables.

### GitHub Pages frontend

1. In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source.
2. Push the changes to the `main` branch or run the **Deploy All Frontends** workflow manually from **Actions**.
3. Confirm the workflow succeeds, then open `https://dharshinia-12.github.io/fullstack/ex3/` and use **Continue with demo employee**.

The frontend build sets `VITE_API_URL` to `https://leave-management-api-hvmk.onrender.com/api`; the Render CORS origins above must include the GitHub Pages origin for browser requests to succeed.

## Leave rules

- Days are counted as inclusive calendar days; weekends are included in this simple lab implementation.
- Applications cannot start in the past, and the end date cannot precede the start date.
- Overlapping pending or approved applications for the same employee are not allowed.
- Pending requests reserve leave days but do not deduct the stored balance until approved.
- Only a manager account can approve or reject a request.
- Only the employee who submitted a request can cancel or withdraw it.

## Compatibility note

If you previously ran the earlier Experiment 3 version, its `Applied` requests had already deducted leave balances at submission time. The updated backend converts those legacy `Applied` records to `Approved` on server startup to avoid deducting them a second time. New requests use the `Pending` approval workflow.

This is an educational lab project. A production HR system would need additional audit, concurrency and organization-specific policy controls.
