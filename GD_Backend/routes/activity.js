const express = require('express');
const router = express.Router();
const connection = require('../db'); // Ensure your database connection is set up
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/authMiddleware'); // Your authentication middleware
const moment = require('moment');

// Configure multer for multiple file uploads with disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
    }
});

const upload = multer({ storage: storage });

// GET route to fetch activities
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT a.id, a.title, a.section, a.start_date, a.end_date, a.logo, a.image, a.video, a.additional_text,
        GROUP_CONCAT(r.room_number) as room_numbers
        FROM activity a
        LEFT JOIN rooms r ON JSON_CONTAINS(a.selected_rooms, CAST(r.id AS JSON), '$')
        WHERE a.user_id = ?
        GROUP BY a.id
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json(results);
    });
});

// POST route for adding a new activity with multiple files
router.post('/add', authenticateToken, upload.fields([
    { name: 'logo', maxCount: 10 },
    { name: 'image', maxCount: 10 },
    { name: 'video', maxCount: 10 }
]), (req, res) => {
    const {
        title,
        section,
        additional_text,
        start_date,
        end_date,
    } = req.body;

    const userId = req.user.id;

    // Extract file paths from the uploaded files
    const logos = req.files.logo ? req.files.logo.map(file => file.filename) : [];
    const images = req.files.image ? req.files.image.map(file => file.filename) : [];
    const videos = req.files.video ? req.files.video.map(file => file.filename) : [];

    // Format the dates to 'YYYY-MM-DD HH:mm:ss' (without timezone)
    const formattedStartDate = moment(start_date).utc().format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDate = moment(end_date).utc().format('YYYY-MM-DD HH:mm:ss');

    // Check if the formatted dates are valid
    if (!moment(formattedStartDate, 'YYYY-MM-DD HH:mm:ss', true).isValid() || 
        !moment(formattedEndDate, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        return res.status(400).json({ error: 'Invalid date format' });
    }

    // SQL query to insert the new activity
    const query = `
        INSERT INTO activity (title, section, logo, image, video, additional_text, start_date, end_date, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(query, [
        title,
        section,
        JSON.stringify(logos),
        JSON.stringify(images),
        JSON.stringify(videos),
        additional_text,
        formattedStartDate, // Use the correctly formatted start date
        formattedEndDate,   // Use the correctly formatted end date
        userId
    ], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({
            message: 'Activity added successfully',
            activity: {
                id: results.insertId,
                title,
                section,
                logos,
                images,
                videos,
                additional_text,
                start_date: formattedStartDate, // Return formatted start date
                end_date: formattedEndDate      // Return formatted end date
            }
        });
    });
});

// PUT route for updating an activity with multiple files
router.put('/:id', authenticateToken, upload.fields([
    { name: 'logo', maxCount: 10 },
    { name: 'image', maxCount: 10 },
    { name: 'video', maxCount: 10 }
]), (req, res) => {
    const { id } = req.params;
    const {
        title,
        section,
        additional_text,
        start_date,
        end_date,
    } = req.body;

    const userId = req.user.id;

    // Prepare the fields for update
    const logos = req.files.logo ? req.files.logo.map(file => file.filename) : [];
    const images = req.files.image ? req.files.image.map(file => file.filename) : [];
    const videos = req.files.video ? req.files.video.map(file => file.filename) : [];

    // Format the dates
    const formattedStartDate = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDate = moment(end_date).format('YYYY-MM-DD HH:mm:ss');

    // Update query
    let query = `
        UPDATE activity
        SET title = ?, section = ?, logo = ?, image = ?, video = ?, additional_text = ?, start_date = ?, end_date = ?
        WHERE id = ? AND user_id = ?`;

    const params = [
        title,
        section,
        JSON.stringify(logos),
        JSON.stringify(images),
        JSON.stringify(videos),
        additional_text,
        formattedStartDate,
        formattedEndDate,
        id,
        userId
    ];

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ message: 'Activity updated successfully', results });
    });
});

// DELETE route for deleting an activity and its associated files
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // First, retrieve the activity to delete the files from the filesystem
    connection.query('SELECT logo, image, video FROM activity WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        const activity = results[0];
        const filesToDelete = [...(activity.logo ? JSON.parse(activity.logo) : []), ...(activity.image ? JSON.parse(activity.image) : []), ...(activity.video ? JSON.parse(activity.video) : [])];

        // Delete files from the filesystem
        filesToDelete.forEach(file => {
            const filePath = path.join(__dirname, '..', 'uploads', file);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted:', filePath);
                }
            });
        });

        // Then, delete the activity record from the database
        connection.query('DELETE FROM activity WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Activity deleted successfully' });
        });
    });
});

module.exports = router;
