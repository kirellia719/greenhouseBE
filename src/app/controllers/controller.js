const User = require("../models/user");
const WeekRecord = require("../models/weekRecord");
const DayRecord = require("../models/dayRecord");
const Soil = require("../models/soilHumi");
const PhysicalDevice = require("../models/physicaldevice");
const fetch = require("node-fetch");
const request = require("request");
const Threshold = require("../models/threshold");
const moment = require("moment");
const schedule = require("node-schedule");
const Notification = require("../models/notification");
const feeds = ["hum", "light", "soil", "temp"];

function getDaydata(day, feed) {
  const url = `https://io.adafruit.com/api/v2/CanhHoang/feeds/gh-${feed}/data?start_time=${day}T00:00Z&end_time=${day}T23:59:59Z`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}
// create rule at 23:59:59
const rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minute = 59;
rule.second = 59;
//run when time at 23:59:59
schedule.scheduleJob(rule, async function () {
  const currentDay = moment().format("YYYY-MM-DD");
  const weekDay = moment(currentDay).format("dddd");
  const recentWeekRC = await WeekRecord.findOne()
    .sort("-created_at")
    .populate("daydatas");
  let dayRc = new DayRecord({
    date: currentDay,
    weekday: weekDay,
    temp: 0,
    hum: 0,
    soil: 0,
    light: 0,
  });
  for (let feed of feeds) {
    const feedData = await getDaydata(currentDay, feed);
    if (feedData.length > 0) {
      var value =
        feedData.reduce((a, b) => a + parseInt(b.value), 0) / feedData.length;
      if (value != NaN) dayRc[feed] = value;
    }
  }
  if (recentWeekRC) {
    const rcWeekDay =
      recentWeekRC.daydatas[recentWeekRC.daydatas.length - 1].weekday;
    if (rcWeekDay != weekDay) {
      dayRc.save().catch((error) => console.log(error));
    }
    if (weekDay != "Monday" && rcWeekDay != weekDay) {
      recentWeekRC.daydatas.push(dayRc);
      recentWeekRC.save();
    } else if (weekDay == "Monday") {
      let newWeekRC = new WeekRecord({
        startday: currentDay,
        daydatas: [dayRc._id],
      });
      newWeekRC.save().catch((err) => console.log(err));
    } else {
      console.log("updated");
    }
  } else {
    let newWeekRC = new WeekRecord({
      startday: currentDay,
      daydatas: [dayRc._id],
    });
    dayRc.save().catch((error) => console.log(error));
    newWeekRC.save().catch((err) => console.log(err));
  }
  console.log("record updated");
});

class AppController {
  createUser(req, res, next) {
    let newUser = new User({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    newUser
      .save()
      .then(() => res.status(200).json("success"))
      .catch((err) => res.json({ err: err }));
  }

  getUser(req, res, next) {
    User.findOne({ username: req.body.username })
      .lean()
      .then((user) => {
        console.log(user);
        if (user) {
          if (user.password === req.body.password) {
            req.session.username = user.username;
            res.json(user);
          } else {
            res.json({ err: "Wrong password" });
          }
        } else {
          console.log("lol");
          res.json("Invalid user");
        }
      })
      .catch((err) => res.json(err));
  }

  logOut(req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.json("success");
        }
      });
    }
  }

  getThreshold(req, res, next) {
    Threshold.find()
      .lean()
      .then((threshold) => {
        res.json(threshold);
      })
      .catch((err) => {
        res.json(err);
      });
  }

  setThreshold(req, res, next) {
    let type = req.body.type;
    let min = req.body.min;
    let max = req.body.max;
    Threshold.findOneAndUpdate(
      { type: type },
      { $set: { min: min, max: max } },
      { new: true },
      (err, doc) => {
        if (err) {
          res.json(err);
        } else {
          res.json(doc);
        }
      }
    );
  }

  getDeviecDetail(req, res) {
    PhysicalDevice.find()
      .lean()
      .then((device) => {
        res.json(device);
      })
      .catch((err) => {
        res.json(err);
      });
  }

  setNotification(req, res) {
    console.log("lol");
    let newNotification = new Notification({
      time: req.body.time,
      message: req.body.message,
    });
    newNotification
      .save()
      .then(() => res.status(200).json("success"))
      .catch((err) => res.json({ err: err }));
  }

  getNotification(req, res) {
    Notification.find()
      .lean()
      .then((notification) => {
        res.json(notification);
      })
      .catch((err) => {
        res.json(err);
      });
  }

  async saveDeviceHistory(req, res) {
    PhysicalDevice.findOne({ name: req.body.name })
      .lean()
      .then((device) => {
        if (device) {
          let curhistory;
          if (device.history.length > 0) {
            curhistory = device.history[device.history.length - 1];
            if (curhistory.status == true) {
              device.usetimes += Date.now() - curhistory.time;
            }
          }

          let history = req.body.history;
          if (
            curhistory.username == history.username &&
            curhistory.status == history.status
          )
            return;
          device.history.push(history);
          PhysicalDevice.findOneAndUpdate(
            { name: device.name },
            {
              $set: {
                history: device.history,
                status: history.status,
                usetimes: device.usetimes,
              },
            }
          );
        } else {
          console.log("NOT FOUND");
        }
      })
      .catch((error) => console.log(error));
  }

  getPhysicalDevice(req, res, next) {
    PhysicalDevice.findOne({ name: req.query.name })
      .lean()
      .then((device) => {
        res.json(device);
      })
      .catch((err) => res.json({ err: err }));
  }

  createDayRecord(req, res, next) {}

  async getDayRecord(req, res, next) {
    const currentDay = "2022-04-01";
    const weekDay = moment(currentDay).format("dddd");
    const recentWeekRC = await WeekRecord.findOne()
      .sort("-created_at")
      .populate("daydatas");

    let dayRc = new DayRecord({
      date: currentDay,
      weekday: weekDay,
      temp: 0,
      hum: 0,
      soil: 0,
      light: 0,
    });
    for (let feed of feeds) {
      const feedData = await getDaydata(currentDay, feed);
      var value =
        feedData.reduce((a, b) => a + parseInt(b.value), 0) / feedData.length;
      console.log(value);
      dayRc[feed] = value;
    }
    if (recentWeekRC) {
      const rcWeekDay =
        recentWeekRC.daydatas[recentWeekRC.daydatas.length - 1].weekday;
      if (rcWeekDay != weekDay) {
        dayRc.save().catch((error) => console.log(error));
      }
      if (weekDay != "Monday" && rcWeekDay != weekDay) {
        recentWeekRC.daydatas.push(dayRc);
        recentWeekRC.save();
      } else if (weekDay == "Monday") {
        let newWeekRC = new WeekRecord({
          startday: currentDay,
          daydatas: [dayRc._id],
        });
        newWeekRC.save().catch((err) => console.log(err));
      } else {
        console.log("already updated");
      }
    } else {
      console.log(dayRc);
      let newWeekRC = new WeekRecord({
        startday: currentDay,
        daydatas: [dayRc._id],
      });
      dayRc.save().catch((error) => console.log(error));
      newWeekRC.save().catch((err) => console.log(err));
    }
    res.json("success");
  }

  getWeekRecord(req, res, next) {
    WeekRecord.findOne({ startday: req.query.startday })
      .lean()
      .populate("daydatas")
      .then((record) => {
        res.json(record);
      })
      .catch((err) => console.log(err));
  }
}

module.exports = new AppController();
