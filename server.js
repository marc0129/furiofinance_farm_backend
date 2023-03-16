
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const apyController = require("./app/controllers/apys");

var corsOptions = {
  origin: "*"
};

const app = express();

//for vercel deployment
// app.use(express.static('public'));

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

app.get('/api/computed-apys', apyController.getAPYS);
  

setInterval(() => {
  apyController.calculateAndSave();
}, 120000);


const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`listening on port ${PORT}`));

//for vercel deplyment
// app.listen(PORT, () => console.log(`listening on port ${PORT}`));

