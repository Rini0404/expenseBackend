const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const Provider = require("oidc-provider");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

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

app.use(admin.options.rootPath, adminRouter);
app.use(express.json());
app.use(cors());

app.use(
  "/oidc",
  oidc.callback(),
  (req, res) => {
    console.log(req);
  }
);

app.post("/", function (req, res) {
  console.log(req.body);
  res.send("thank you from post route");
});

app.get("/", (req, res) => {
  console.log(req.query);
  res.sendFile(__dirname + "/views/oidc.html");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
