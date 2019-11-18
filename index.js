const { Boost, R2D2 } = require("boost-movehub");
// const { Boost, R2D2 } = require("./src/stubs/BoostMovehub.js");
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const boost = new Boost("001653aeb339", { logger: console });

let isConnected = false;
let r2;
let r2Values = {};
let sockets = [];
let cmdQueue = [];

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server);

function sendToSockets(type) {
  io.emit("data", type, r2Values[type]);
}

boost.on("hubConnected", async hub => {
  try {
    console.log("hub connected");
    isConnected = true;
    hub.on("disconnect", () => {
      isConnected = false;
      r2Values = {};
      boost.startScanning();
    });

    // Is that what we want?
    r2 = new R2D2(hub, { logger: console });

    r2.on("distance", distance => {
      console.log("distance", distance);
      r2Values.distance = distance;
      sendToSockets("distance");
    });
    r2.on("color", color => {
      console.log("color", color);
      r2Values.color = color;
      sendToSockets("color");
    });
    r2.on("tilt", tilt => {
      console.log("tilt", tilt);
      r2Values.tilt = tilt;
      sendToSockets("tilt");
    });
    r2.on("current", current => {
      console.log("current", current);
      r2Values.current = current;
      sendToSockets("current");
    });
    r2.on("voltage", voltage => {
      console.log("voltage", voltage);
      r2Values.voltage = voltage;
      sendToSockets("voltage");
    });
    r2.on("headTurn", degrees => {
      console.log("headTurn", degrees);
      r2Values.headTurnedDegrees = degrees;
      sendToSockets("headTurnedDegrees");
    });
    r2.on("turn", degrees => {
      console.log("turn", degrees);
      r2Values.turnedDegrees = degrees;
      sendToSockets("turnedDegrees");
    });

    processR2Queue();
  } catch (err) {
    console.error(err);
  }
});

boost.startScanning();

function callOnR2(part, cmd, args) {
  if (r2) {
    r2[part][cmd](...args);
  } else {
    cmdQueue.push([part, cmd, args]);
  }
}
function processR2Queue() {
  cmdQueue.forEach((part, cmd, args) => callOnR2(part, cmd, args));
  cmdQueue = [];
}

io.on("connection", socket => {
  console.log("Socket connected");
  sockets.push(socket);
  socket.on("disconnect", () => {
    // Remove socket on disconnect
    sockets = sockets.filter(s => socket.id !== s.id);
  });
  socket.on("cmd", (part, cmd, args) => {
    callOnR2(part, cmd, args);
  });
});

app.get("/", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.send(JSON.stringify(r2Values));
});

app.post("/cmd/", (req, res) => {
  r2[req.body.part][req.body.cmd](...(req.body.args || []));

  res.send(true);
});

const port = process.env.PORT || 3000;

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
