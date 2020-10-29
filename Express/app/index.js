const express = require("express")
const app = express()

app.get("/test_api", (req, res) => {
    res.send('Hello Worldだぜ');
});

app.listen(8080)