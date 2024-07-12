const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
app.get("/", (req, res)=>{
    console.log(`Landing called`);
    res.send("Landing called");
});

app.listen(PORT, ()=> {
    console.log(`Landing started on port = '${PORT}'`);
});
