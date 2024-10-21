require('dotenv').config();
const express = require('express');
const cors = require('cors');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const roomsRouter = require('./routes/rooms');
const facilitiesRouter = require('./routes/facility')
const messageRouter = require('./routes/messages')
const activityRouter = require('./routes/activity')
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); 


app.use('/uploads', express.static('uploads'));
app.use('/register', registerRouter); 
app.use('/login', loginRouter); 
app.use('/rooms', roomsRouter); 
app.use('/facilities', facilitiesRouter);
app.use('/messages',messageRouter);
app.use('/activity',activityRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});