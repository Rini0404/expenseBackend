const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 8080;

const admin = new AdminJS({ rootPath: "/admin" });

const adminRouter = AdminJSExpress.buildRouter(admin);

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
