import "dotenv/config";
// import bodyParser from "body-parser";
import express from "express";
import routes from "./routes";

const app = express();

// 3rd party middleware
// Parses the text as JSON and exposes the resulting object on req.body
// app.use(bodyParser.json());
// Parses the text as URL encoded data
// and exposes the resulting object (containing the keys and values) on req.body
// app.use(bodyParser.urlencoded({extended: true}));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// modular routes
app.use(routes.home);

function getIp() {
  const ip = process.env.IP;
  if (!ip) {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  } else {
    return ip;
  }
}

app.listen(process.env.PORT, getIp());
