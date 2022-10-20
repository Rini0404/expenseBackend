const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const Provider = require("oidc-provider");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;
const axios = require("axios");
const fetch = require("node-fetch");

/** AdminJS Setup */
// Database
const connection = require("./config/db.config");
const adapter = require("./config/mongoAdapter");
const Users = require("./models/User");

AdminJS.registerAdapter(AdminJSMongoose);

const AdminJSOptions = {
  resources: [Users],
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

/** OIDC Provider Setup */

const oidcOptions = require("./config/oidc.config");
const oidc = new Provider("http://localhost:3000/oidc", {
  adapter,
  ...oidcOptions,
});
//const oidc = new Provider("http://localhost:3000/oidc", oidcOptions);
oidc.proxy = true;


app.set('view engine', 'ejs');
app.use(cors());
app.use(admin.options.rootPath, adminRouter);

// app.use(express.json({
//   limit: "10000kb",
//   extended: true,
//   parameterLimit: 50000
// }));

// app.use(express.urlencoded({
//   limit: "10000kb",
//   extended: true,
//   parameterLimit: 50000
// }));

// init middleware
app.use(express.json({ extended: false }));

app.use("/oidc", oidc.callback(), (req, res) => {
  console.log(req);
});

app.use(express.static("./assets"));
app.use(express.static("./public"));
// app.use("/pops", require("./routes/pops"));
// app.use("/swaps", require("./routes/swaps"));
app.use("/gdrive", require("./utils/googledriveHandler"));
app.use("/post", require("./routes/postvid"));
app.use("/users", require("./routes/users"));
app.use("/profile", require("./routes/profile"));

app.get("/", (req, res) => {
  // console.log(req.query, );
  res.sendFile(__dirname + "/views/oidc.html");
});

app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/views/testpage.html");
});

app.get("/appauth", (req, res) => {
  res.sendFile(__dirname + "/views/appauth.html");
});

app.get("/authtest",   function(req, res){
  // axios call then pass in the data to the ejs file
  axios.get('https://dev.devusol.net/users/test')
  .then(function (response) {
    // handle success
    console.log(response.data);
    res.render('authtest', {data: response.data});
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
        
})







app.get("/handle", async function (req, res) {
  // console.log("post recvd ", req.query);

  const clientSecret = "j2j4X8wbWuWjlQGt";
  //const state = req.query.state;
  const clientId = "78u9lqsln6z7j5";
  const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
  const redirectUrl = "https://dev.devusol.net/handle";

  const data = await fetch(tokenUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
    },
    body:
      "grant_type=authorization_code&client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&code=" +
      req.query.code +
      "&redirect_uri=" +
      redirectUrl
  })
    .then((httpResponse) => {
      //console.log(httpResponse);
      if (httpResponse.ok) {
        return httpResponse.json();
      } else {
        return res.send("Fetch did not succeed");
      }
    })
    .then((json) => {
      return json;
    })
    .catch((err) => console.log(err));

  // console.log("Access Token: ", data.access_token);

  const userInfo = await fetch("https://api.linkedin.com/v2/me", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + data.access_token
    }
  })
    .then((httpResponse) => {
      //console.log(httpResponse);
      if (httpResponse.ok) {
        return httpResponse.json();
      } else {
        return res.send("Fetch did not succeed");
      }
    })
    .then((json) => {
      return json;
    })
    .catch((err) => console.log(err));

  // console.log("Data2: ", userInfo);

  const email = await fetch(
    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
    {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + data.access_token
      }
    }
  )
    .then((httpResponse) => {
      //console.log(httpResponse);
      if (httpResponse.ok) {
        return httpResponse.json();
      } else {
        return res.send("Fetch did not succeed");
      }
    })
    .then((json) => {
      return json;
    })
    .catch((err) => console.log(err));

  // console.log("Email: ", email.elements[0]["handle~"].emailAddress);

  const info = {
    email: email.elements[0]["handle~"].emailAddress,
    name: userInfo.localizedFirstName + " " + userInfo.localizedLastName,
    // id: userInfo.id
  };

    res.render("authtest", { info })
});





app.get("*", (req, res) => {
  res.redirect("/admin/login");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// function getVideos() {
//   return fs.promises.readdir("./assets/video");
// }
