const { EventEmitter } = require("events");

class Hub extends EventEmitter {
  constructor() {
    super();
  }
}

class Boost extends EventEmitter {
  constructor() {
    super();
  }

  startScanning() {
    setTimeout(() => {
      this.emit("hubConnected", new Hub());
    }, 100);
  }
}

class R2D2 extends EventEmitter {
  constructor() {
    super();
    setInterval(() => {
      this.emit("distance", Math.floor(Math.random() * 10));
    }, 1000);
    setInterval(() => {
      this.emit("color", Math.floor(Math.random() * 10));
    }, 890);
    setInterval(() => {
      this.emit("current", Math.floor(Math.random() * 1000));
    }, 1220);
    setInterval(() => {
      this.emit("voltage", Math.floor(Math.random() * 900));
    }, 830);
    setInterval(() => {
      this.emit("turn", Math.floor(Math.random() * 720) - 360);
    }, 830);
    setInterval(() => {
      this.emit("headTurn", Math.floor(Math.random() * 720) - 360);
    }, 830);
    setInterval(() => {
      this.emit("tilt", {
        roll: Math.floor(Math.random() * 360) - 180,
        pitch: Math.floor(Math.random() * 360) - 180
      });
    }, 890);
  }
}

module.exports = {
  Boost,
  R2D2
};
