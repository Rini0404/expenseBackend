const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

// Database
const connection = require('./config/db.config');
connection.once('open', ()=>console.log('Database connected Successfully'));
connection.on('error',(err)=>console.log('Error', err));

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

app.use(admin.options.rootPath, adminRouter);
app.use(express.json());
app.use(cors());

app.post("/", function (req, res) {
  console.log(req.body);
  res.send("thank you from post route");
});

app.get("/", (req, res) => {
  console.log(req.query);
  res.send("thank you from get route");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
