# Smart Library Frontend

React + Vite frontend for the Library Management System college project.

This frontend is implemented only around services already exposed by the existing Django backend. No backend change is required.

## Requirements

- Node.js 20+ (Node 22 recommended for the current Vite toolchain)
- Existing Django backend running at `http://127.0.0.1:8000`

## Install

```bash
npm install
npm run dev
```

Then open the URL printed by Vite, normally `http://localhost:5173`.

## Backend API

By default the frontend uses:

```text
http://127.0.0.1:8000/api
```

For another backend URL, create a `.env` file in this frontend folder:

```text
VITE_API_BASE_URL=http://your-backend-host/api
```

## Implemented backend features

- Student registration and login
- JWT access/refresh handling
- Student and librarian role-aware routes
- Student dashboard
- Browse and borrow available books
- Join/leave book queue
- View borrowing history and return books
- View and mark fines as paid
- Librarian dashboard
- Librarian book returns using borrow IDs available from the backend
- Book CRUD
- Category CRUD
- Author CRUD
- Publisher CRUD

The frontend intentionally does not invent APIs or services that are not present in the backend.

## Book cover display

The current Django `Book` model/API does not expose an image field. The frontend therefore tries to display a public Open Library cover by ISBN and automatically falls back to the included `/public/book-placeholder.svg` when no cover is available. No backend change is required.

## Availability and queue behavior

- Students see **Borrow** whenever `available_copies > 0`.
- Students see **Join Queue** only when the backend currently reports `available_copies === 0`.
- The frontend rechecks the individual book endpoint immediately before borrow/queue actions to avoid acting on stale availability.
- A librarian should process a returned borrowed copy through the Dashboard **Return** action. The current backend return endpoint increases availability and notifies the oldest waiting queue entry.
- Manually editing `available_copies` is still supported for stock/catalog corrections, but the current backend has no endpoint that notifies a queue as a side-effect of a manual book edit.

## Verified borrowing sequence

The frontend performs a fresh book lookup immediately before Borrow or Join Queue. This keeps the UI aligned with `available_copies`: while copies are above zero the action is Borrow; once the count reaches zero the action becomes Join Queue. The student Books and Dashboard views refresh queue state periodically so an existing backend `notified` status becomes visible without requiring a page reload.
