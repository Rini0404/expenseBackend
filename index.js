const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;
const Hls = require("hls-server");
const fs = require("fs");


/** AdminJS Setup */
// Database
const connection = require("./config/db.config");

const Users = require("./models/User");

AdminJS.registerAdapter(AdminJSMongoose);

const AdminJSOptions = {
  resources: [Users,],
  rootPath: "/admin",
};

const DEFAULT_ADMIN = {
  email: "rini@admin.com",
  password: "123456",
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

const admin = new AdminJS(AdminJSOptions);
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate,
  cookieName: "adminjs",
  cookiePassword: "sessionsecret",
});

  

app.set("view engine", "ejs");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(admin.options.rootPath, adminRouter);
app.use(express.json({ extended: false }));

app.use(express.static("./assets", { fallthrough: true }));
app.use(express.static("./public"));
app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));
app.use("/socialLogins", require("./routes/socialLogins"));

app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/views/testpage.html");
});


app.get("*", (req, res) => {
  // console.log("fallthrough")
  res.redirect("/admin/login");
});

const server = app.listen(port, (err) => {
  if (err) { console.log("ERROR!!!", err) }
  console.log(`Example app listening on port ${port}`);
});

