# 🏥 MediQueue | High-Concurrency Doctor Booking System

![Status](https://img.shields.io/badge/Status-Live-success)
![Stack](https://img.shields.io/badge/Tech-React%20|%20Node%20|%20Postgres-blue)

**Live Frontend:** [https://mediqueue-app.vercel.app](https://mediqueue-app.vercel.app)  
**Backend API:** [https://mediqueue-backend-f4lv.onrender.com](https://mediqueue-backend-f4lv.onrender.com)

---

## 🚀 Project Overview
**MediQueue** is a full-stack healthcare appointment system designed to simulate high-traffic scenarios (like vaccination drives or flash bookings).

Unlike standard booking apps, MediQueue focuses on **Data Integrity** and **Concurrency Control**. It guarantees **Zero Overbooking** even when thousands of users attempt to book the exact same slot simultaneously.

---

## 💡 Key Innovation: Pessimistic Locking
Most booking systems fail under load because of "Read-Modify-Write" race conditions.
MediQueue solves this using **Database Row-Level Locking** (Pessimistic Concurrency Control).

**The Logic:**
1.  **Transaction Start:** `BEGIN;`
2.  **Locking:** `SELECT * FROM slots WHERE id = $1 FOR UPDATE;`
    * *This locks the specific row in PostgreSQL. Other requests must wait in a queue until this transaction finishes.*
3.  **Validation:** Check if `booked_seats < total_seats`.
4.  **Update:** Increment seat count & Insert Booking.
5.  **Commit:** `COMMIT;` releases the lock.

---

## 🛠️ Tech Stack

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | React.js + TypeScript | Type safety, Component-based architecture. |
| **Styling** | Tailwind CSS | Rapid UI development, responsive design. |
| **Backend** | Node.js + Express | Non-blocking I/O, ideal for handling concurrent requests. |
| **Database** | PostgreSQL (Neon.tech) | ACID compliance, robust locking mechanisms (`FOR UPDATE`). |
| **Deployment** | Vercel (FE) + Render (BE) | Scalable cloud infrastructure with CI/CD. |

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Local or Cloud)

### 1. Clone the Repository
```bash
git clone [https://github.com/abhijeetsharma016/mediqueue-app.git](https://github.com/abhijeetsharma016/mediqueue-app.git)
cd mediqueue-app
````

### 2\. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```env
PORT=5000
DATABASE_URL=your_postgres_connection_string
```

Run the server:

```bash
npm run dev
```

### 3\. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the client:

```bash
npm run dev
```

Open `http://localhost:5173` to view the app.

-----

## 📡 API Documentation

### Base URL: `/api`

| Method | Endpoint | Description | Body Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/slots` | Fetch all available doctor slots | None |
| `POST` | `/book` | Book a specific slot (Atomic) | `{ "userId": "string", "slotId": number }` |
| `POST` | `/admin/slots` | Create new slots (Admin) | `{ "doctorId": 1, "startTime": "...", "totalSeats": 5 }` |

-----

## 📈 Scalability Considerations (Production)

To scale this system to millions of users (e.g., RedBus/BookMyShow level), the following architecture is proposed:

1.  **Load Balancing:** Use NGINX or AWS ALB to distribute traffic across multiple Node.js instances.
2.  **Database Scaling:** Implement **Read Replicas** (Master-Slave) to separate Read traffic (Viewing slots) from Write traffic (Booking).
3.  **Caching:** Use **Redis** to cache slot availability, reducing database load for `GET /slots` requests.
4.  **Queue System:** For extreme loads, decouple bookings using RabbitMQ/Kafka to process requests asynchronously.

-----

## 👤 Author

**Abhijeet Sharma** *SRM Institute of Science and Technology* [GitHub](https://www.google.com/search?q=https://github.com/abhijeetsharma016)