import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

// gets all the slots
router.get('/slots', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT s.id, d.name as doctor_name, s.start_time, s.total_seats, s.booked_seats
            FROM slots s
            JOIN doctors d ON s.doctor_id = d.id
            ORDER BY s.start_time ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Locking mechanism
router.post('/book', async (req: Request, res: Response) => {
    const { userId, slotId } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start Transaction

        //I am locking the row to prevent race conditions
        const slotRes = await client.query(
            'SELECT * FROM slots WHERE id = $1 FOR UPDATE', 
            [slotId]
        );

        if (slotRes.rows.length === 0) throw new Error('Slot not found');
        
        const slot = slotRes.rows[0];

        if (slot.booked_seats >= slot.total_seats) {
            await client.query('ROLLBACK');
            res.status(400).json({ status: 'FAILED', message: 'Slot Full' });
            return; 
        }

        // Proceed to book
        await client.query(
            'UPDATE slots SET booked_seats = booked_seats + 1 WHERE id = $1',
            [slotId]
        );

        await client.query(
            'INSERT INTO bookings (user_id, slot_id, status) VALUES ($1, $2, $3)',
            [userId, slotId, 'CONFIRMED']
        );

        await client.query('COMMIT'); // End Transaction
        res.status(200).json({ status: 'CONFIRMED', message: 'Booking successful' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ status: 'FAILED', message: 'Internal Error' });
    } finally {
        client.release();
    }
});

export default router;