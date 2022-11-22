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
  email: "sean@devusol.com",
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

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true })); 

app.use(express.static("./assets", { fallthrough: true }));
app.use(express.static("./public"));
app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));

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

const hlsServer = new Hls(server, {
  provider: {
    exists: (req, cb) => {
      const ext = req.url.split(".").pop();
      //console.log("ext: ", req.url.split("."))
      // ext = ext.pop();
      if (ext != "m3u8" && ext != "ts") {
        //   console.log(`${ext} is not hls related`)
        return cb(null, true);
      }
      // console.log(`checking if ${ext} file exists`)
      fs.access(`${__dirname}/assets/${req.url}`, fs.constants.F_OK, function (er) {
        if (er) {
          // console.log("unable to find file: ", er);
          return cb(null, false);
        }
        //  console.log("it does")
        cb(null, true);
      });


    },
    getManifestStream: (req, cb) => {
      //  console.log(`get manifest file ${__dirname}/assets/${req.url}`)
      const stream = fs.createReadStream(`${__dirname}/assets/${req.url}`);
      /// console.log("get manifest:", stream)
      cb(null, stream);
    },
    getSegmentStream: (req, cb) => {
      // console.log(`get stream ${__dirname}/assets/${req.url}`)
      const stream = fs.createReadStream(`${__dirname}/assets/${req.url}`, { bufferSize: 64 * 1024 });
      cb(null, stream);
    }
  }
});
