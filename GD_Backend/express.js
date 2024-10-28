require('dotenv').config();
const express = require('express');
const cors = require('cors');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const roomsRouter = require('./routes/rooms');
const facilitiesRouter = require('./routes/facility');
const messageRouter = require('./routes/messages');
const channelRouter = require('./routes/channel');
const groupRouter = require('./routes/group');  // Import the group router
const appsRouter = require('./routes/apps');  // Import the apps router
const activityRouter = require('./routes/activity') // Import activity (welcome page) router

const app = express();
const PORT = 3001;
const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/TVLauncher', express.static(path.join(__dirname, 'TVLauncher')));
app.use('/uploads', express.static('uploads'));
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/rooms', roomsRouter);
app.use('/facilities', facilitiesRouter);
app.use('/messages', messageRouter);
app.use('/channels', channelRouter);
app.use('/groups', groupRouter); // Add the group router
app.use('/apps', appsRouter); // Add the apps router
app.use('/activity',activityRouter); // Add the activity (welcome page) router 

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});