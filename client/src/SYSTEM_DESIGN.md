# MediQueue - System Design Document

## 1. Overview
MediQueue is a high-concurrency Doctor Appointment Booking System designed to handle race conditions during peak traffic (e.g., vaccination drives or flash sales). It ensures data integrity and prevents overbooking through strict architectural patterns.

## 2. Architecture
The system follows a 3-Tier Architecture:
- **Frontend (Client):** React.js + TypeScript + Tailwind CSS (Deployed on Vercel).
- **Backend (API):** Node.js + Express.js (Deployed on Render).
- **Database (Persistence):** PostgreSQL (Managed by Neon.tech).

## 3. The "Innovation" - Concurrency Handling
The core differentiator of this system is its approach to **Race Conditions**.
Instead of simple application-level checks, MediQueue implements **Pessimistic Concurrency Control** at the Database level.

### The Locking Strategy
When a user attempts to book a seat, the system executes a transaction with the following logic:

1. **BEGIN Transaction**
2. **SELECT ... FOR UPDATE:** This SQL command locks the specific slot row. No other transaction can read or write to this row until the current one completes. This serializes requests for the same slot.
3. **Validation:** Checks if `booked_seats < total_seats`.
4. **Update & Commit:** Increments the counter and inserts the booking record.
5. **COMMIT:** Releases the lock.

This guarantees that even if 1000 users click "Book" at the exact same millisecond, 0 overbookings will occur.

## 4. Scalability Strategy (Production)
To scale this for millions of users (like BookMyShow/RedBus), the following would be implemented:
- **Database:** Implementation of Read Replicas (Master-Slave architecture) to offload read traffic (Show listings) from the Master DB (Bookings).
- **Load Balancing:** AWS Application Load Balancer (ALB) to distribute traffic across multiple Node.js instances.
- **Caching:** Redis to cache the "Get Slots" API response, reducing database hits for viewing availability.