const path = require("path");
const express = require("express");
const session = require("express-session");
const socketio = require("socket.io");
const http = require("http");
const app = express();
const port = 4000;
const db = require("./config/db");
const server = http.createServer(app);
const io = socketio(server);
const route = require("./routes/index");
const methodOverride = require("method-override");
const cors = require("cors");
const { default: fetch } = require("node-fetch");
const mqttclient_ = require("../src/config/mqtt/mqttConnect");

const mqttclient = mqttclient_.getInstance();

let temp_min = 0;
let temp_max = 0;
let hum_min = 0;
let hum_max = 0;
let light_min = 0;
let light_max = 0;
let soil_min = 0;
let soil_max = 0;

function saveDeviceHistory(name, data_str, data) {
  fetch(`http://localhost:4000/saveDeviceHistory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      history: {
        time: new Date().toLocaleString(),
        status: data == data_str ? false : true,
      },
    }),
  });
}

function notifyMessage(msg) {
  fetch("http://localhost:4000/notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      time: new Date().toLocaleString(),
      message: msg,
    }),
  });
}

db.connect();

async function getThreshold() {
  let res = await fetch("http://localhost:4000/threshold");
  let data = await res.json();
  data.map((item) => {
    if (item.type == "TEMP") {
      temp_min = item.min;
      temp_max = item.max;
    } else if (item.type == "HUM") {
      hum_min = item.min;
      hum_max = item.max;
    } else if (item.type == "LIGHT") {
      light_min = item.min;
      light_max = item.max;
    } else if (item.type == "SOIL") {
      soil_min = item.min;
      soil_max = item.max;
    }
  });
}

getThreshold();

mqttclient.on("message", (topic, message) => {
  const feed = topic.split("/")[2];
  let data = message.toString();
  switch (feed) {
    case "GH_BULB":
      saveDeviceHistory("LIGHT", "0", data);
      break;

    case "GH_FAN":
      saveDeviceHistory("FAN", "3", data);
      break;

    case "GH_PUMP":
      saveDeviceHistory("PUMP", "5", data);
      break;

    default:
      if (feed == "GH_TEMP" && (message < temp_min || message > temp_max)) {
        let msg = `Nhiệt độ vượt quá khoảng cho phép từ ${temp_min} đến ${temp_max}, giá trị vượt ngưỡng là ${message}`;
        notifyMessage(msg);
      } else if (feed == "GH_HUM" && (message < hum_min || message > hum_max)) {
        let msg = `Độ ẩm vượt quá khoảng cho phép từ ${hum_min} đến ${hum_max}, giá trị vượt ngưỡng là ${message}`;
        notifyMessage(msg);
      } else if (
        feed == "GH_LIGHT" &&
        (message < light_min || message > light_max)
      ) {
        let msg = `Độ sáng vượt quá khoảng cho phép từ ${light_min} đến ${light_max}, giá trị vượt ngưỡng là ${message}`;
        notifyMessage(msg);
      } else if (
        feed == "GH_SOIL" &&
        (message < soil_min || message > soil_max)
      ) {
        let msg = `Độ ẩm đất vượt quá khoảng cho phép từ ${soil_min} đến ${soil_max}, giá trị vượt ngưỡng là ${message}`;
        notifyMessage(msg);
      }
  }
});

app.use(
  session({
    secret: "somethingsecret",
    resave: true,
    saveUninitialized: false,
  })
);

app.use(methodOverride("_method"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(cors());

route(app);

server.listen(port, () => {
  console.log(`Greenhouse program app listening at http://localhost:${port}`);
});
