const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const Provider = require("oidc-provider");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const port = process.env.PORT || 3000;

const videoPath = "./assets/video";

/** AdminJS Setup */
// Database
const connection = require('./config/db.config');
const adapter = require('./config/mongoAdapter');
const Users = require('./models/User')



AdminJS.registerAdapter(AdminJSMongoose)

const AdminJSOptions = {
  resources: [Users],
  rootPath: "/admin"
}

const DEFAULT_ADMIN = {
  email: 'sean@devusol.com',
  password: '123456',
}

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN)
  }
  return null
}

const admin = new AdminJS(AdminJSOptions);
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: 'sessionsecret',
  },
);

/** OIDC Provider Setup */

const oidcOptions = require('./config/oidc.config')
const oidc = new Provider("http://localhost:3000/oidc", { adapter, ...oidcOptions });
//const oidc = new Provider("http://localhost:3000/oidc", oidcOptions);
oidc.proxy = true;

// console.log(require("os").hostname())

app.use(admin.options.rootPath, adminRouter);
app.use(express.json({
  limit: "100mb",
  extended: true,
  parameterLimit: 50000
}));

app.use(express.urlencoded({
  limit: "100mb",
  extended: true,
  parameterLimit: 50000
}));
app.use(cors());

app.use(
  "/oidc",
  oidc.callback(),
  (req, res) => {
    console.log(req);
  }
);

app.use(express.static(__dirname + "/assets"));
// app.use(express.json({limit: "1000mb"}))

const upload = multer({dest: __dirname + "/assets/video/"});

app.post("/postVideo", upload.single("fileSel"), function (req, res) {
  req.on("data", (chunk) => {
    console.log(chunk)
  });
  console.log(req);
  // console.log(req.files)
  res.end("GOT FILE");
});

app.get("/", (req, res) => {
  // console.log(req.query, );
  res.sendFile(__dirname + "/views/oidc.html");
});

app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/views/testpage.html");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function getVideos() {
  return fs.promises.readdir("./assets/video");
}