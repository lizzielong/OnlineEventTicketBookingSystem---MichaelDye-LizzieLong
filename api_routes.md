# API Routes Specification
This document defines the API endpoints required by the **Online Event Ticket Booking System** frontend to communicate with the Flask backend.

---

## Overview

The system supports two user roles:

- **Customer** → browse events, book tickets, cancel reservations, view booking history.  
- **Admin** → add, update, and delete events; generate reports.

These routes enable the frontend (HTML/JS) to fetch and send data through JSON requests.

---

## 1. Event Routes (For All Users)

| Purpose | Method | Endpoint | Used On | Description |
|----------|---------|-----------|----------|--------------|
| Get all events | `GET` | `/api/events` | `index.html` | Retrieve list of all upcoming events |
| Get one event | `GET` | `/api/events/<id>` | `event.html` | Retrieve details for a specific event |
| Create event | `POST` | `/api/events` | `admin.html` | Admin adds a new event |
| Update event | `PUT` | `/api/events/<id>` | `admin.html` | Admin updates an event |
| Delete event | `DELETE` | `/api/events/<id>` | `admin.html` | Admin deletes an event |

---

## 2. Booking Routes (Customer)

| Purpose | Method | Endpoint | Used On | Description |
|----------|---------|-----------|----------|--------------|
| Make a booking | `POST` | `/api/bookings` | `event.html` | Customer books tickets for an event |
| View user's bookings | `GET` | `/api/users/<id>/bookings` | `bookings.html` | Display a customer’s booking history |
| Cancel booking | `DELETE` | `/api/bookings/<id>` | `bookings.html` | Cancel an existing reservation |

---

## 3. User & Authentication Routes (Optional, For Future Login)

| Purpose | Method | Endpoint | Used On | Description |
|----------|---------|-----------|----------|--------------|
| Register | `POST` | `/api/register` | `login.html` | Create a new account |
| Login | `POST` | `/api/login` | `login.html` | Log in and return user info/role |
| Get user info | `GET` | `/api/users/<id>` | (internal) | Retrieve profile data or verify session |

---

## 4. Reports (Admin Only – Optional)

| Purpose | Method | Endpoint | Used On | Description |
|----------|---------|-----------|----------|--------------|
| Sales report | `GET` | `/api/reports/sales` | `admin.html` | View total ticket sales by date/event |
| Event report | `GET` | `/api/reports/event/<id>` | `admin.html` | View detailed bookings for a single event |

---

## Example Implementations

### Example: `GET /api/events`
**Frontend**
```javascript
fetch("http://127.0.0.1:5000/api/events")
  .then(res => res.json())
  .then(events => console.log(events));
