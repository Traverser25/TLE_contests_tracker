const express = require('express');
const connectDB = require('./src/utils/dbconfig');

const main_route=require('./src/route/user_routes')
const contestRouter=require('./src/route/contest_routes')
const app = express();

app.use(express.json())
app.use('/',main_route)
app.use("/api", contestRouter);

// Connect to MongoDB
connectDB();

app.get('/', (req, res) => {
    res.send('Contest Backend is running!');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


