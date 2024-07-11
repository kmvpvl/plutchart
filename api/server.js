const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
app.get("/", (req, res)=>{
    console.log(`API called`);
    res.send("API called");
});

app.listen(PORT, ()=> {
    console.log(`API started on port = '${PORT}'`);
});
