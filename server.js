
const cron = require('node-cron');
const express = require('express');
const connectDB = require('./config/db');

const app = express();
//connect DB
connectDB();

// Declare body parser; which now has merged into express
// former app.use(bodyParser... need to bring in bodyParser
app.use(express.json({extended:false}));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const port = process.env.port || 5000 

app.listen(port, (req, res)=> {
    console.log(`> Server running ${port}`)
});

app.get('/', (req, res) => res.send('API running'));

// cron.schedule('*/1 * * * *', () => {
//     console.log('running a task every two minutes');
// });