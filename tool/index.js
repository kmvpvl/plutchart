const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;
app.get("/", (req, res)=>{
    console.log(`Tool called`);
    res.send("Tool called");
});

app.listen(PORT, ()=> {
    console.log(`Tool started on port = '${PORT}'`);
});
