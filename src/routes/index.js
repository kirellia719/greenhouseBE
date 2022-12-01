const AppController = require("../app/controllers/controller");

function route(app) {
  app.get("/", (req, res) => res.json("Connected"));
  app.get("/getphysicaldevice", AppController.getPhysicalDevice); //ex: localhost:4080/getphysicaldevice?name=<device-name>
  app.get("/getdayrecord", AppController.getDayRecord); // test routes
  app.get("/getweekrecord", AppController.getWeekRecord); //ex: localhost:4080/getweekrecord?startday=<YYYY-MM-DD>
  app.post("/register", AppController.createUser);
  app.post("/login", AppController.getUser);
  app.get("/logout", AppController.logOut);
  app.get("/getdevicedetail", AppController.getDeviecDetail);
  app.post("/saveDeviceHistory", AppController.saveDeviceHistory);
  app.get("/threshold", AppController.getThreshold);
  app.post("/threshold", AppController.setThreshold);
  app.get("/notification", AppController.getNotification);
  app.post("/notification", AppController.setNotification);
}

module.exports = route;
