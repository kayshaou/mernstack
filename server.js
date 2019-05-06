const express = require('express');
const app = express();
const port = process.env.port || 5000 

app.listen(port, (req, res)=> {
    console.log(`running ${port}`)
});

app.get('/', (req, res) => res.send('API running'));