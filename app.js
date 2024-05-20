const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const user = require('./services/user');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/user", user);

app.get('/ping', (req, res) => {
  res.send('pong 🏓')
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, (err, res) => {
    if (err) {
        console.log(err)
        return res.status(500).send(err.message)
    } else {
        console.log('[INFO] Server Running on PORT:', PORT)
    }
})

module.exports = app;
