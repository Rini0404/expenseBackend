const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const Provider = require("oidc-provider");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const axios = require("axios");
const fetch = require("node-fetch");
const Hls = require("hls-server");
const fs = require("fs");

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
// const { default: checkBox } = require("@adminjs/design-system/types/atoms/check-box");
const oidc = new Provider("http://localhost:3000/oidc", {
  adapter,
  ...oidcOptions,
});
//const oidc = new Provider("http://localhost:3000/oidc", oidcOptions);
oidc.proxy = true;

app.set("view engine", "ejs");
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
app.use("/pops", require("./routes/pops"));
// app.use("/swaps", require("./routes/swaps"));
app.use("/gdrive", require("./utils/googledriveHandler"));
// app.use("/post", require("./routes/postvid"));
app.use("/users", require("./routes/users"));
app.use("/profile", require("./routes/profile"));
app.use("/auth", require("./routes/auth"));
app.use("/social", require("./routes/Social"));

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

app.get("/policy", (req, res) => {
  res.sendFile(__dirname + "/views/Policy.html");
})

app.get("/authtest", function (req, res) {
  // axios call then pass in the data to the ejs file
  axios
    .get("https://dev.devusol.net/users/test")
    .then(function (response) {
      // handle success
      console.log(response.data);
      res.render("authtest", { data: response.data });
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

app.get("/fbHandle", async (req, res) => {
  let redirectURIfb = "https://dev.devusol.net/fbHandle";
  let appSecrete = `5f155c61526fbfdd589770129adbb9c6`;
  let fbId = `3184359635207513`;
  let fbTokenUrl = `https://graph.facebook.com/v10.0/oauth/access_token?client_id=${fbId}&redirect_uri=${redirectURIfb}&client_secret=${appSecrete}&code=${req.query.code}`;

  const { code } = req.query;

  const fbToken = await fetch(fbTokenUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${code}`,
    }
  },
  );
  const fbTokenJson = await fbToken.json();

  const fbProfileUrl = `https://graph.facebook.com/me?fields=picture,name,email&access_token=${fbTokenJson.access_token}`;

  const getFbInfo = await fetch(fbProfileUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${fbTokenJson.access_token}`,
    }
  },
  );
  const fbInfoJson = await getFbInfo.json();

//  let fbPic = fbInfoJson.picture.data.url;


  let socialInfo = {
    name: fbInfoJson.name,
    email: fbInfoJson.email,
    // picture: fbPic,
  };

  
  res.render("authtest", { socialInfo });

});

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
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body:
      "grant_type=authorization_code&client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&code=" +
      req.query.code +
      "&redirect_uri=" +
      redirectUrl,
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


  const userInfo = await fetch("https://api.linkedin.com/v2/me", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + data.access_token,
    },
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
        Authorization: "Bearer " + data.access_token,
      },
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

  const socialInfo = {
    email: email.elements[0]["handle~"].emailAddress,
    name: userInfo.localizedFirstName + " " + userInfo.localizedLastName,
    // id: userInfo.id
  };


  res.render("authtest", { socialInfo });
});

app.get("*", (req, res) => {
  res.redirect("/admin/login");
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const hlsServer = new Hls(server, {
  provider: {
    exists: (req, cb) => {
      const ext = req.url.split(".").pop;
      
      if(ext != "m3u8" && ext != "ts") {
        return cb(null, true);
      }
      fs.access(`${__dirname}/assets/${req.url}`, fs.constants.F_OK, function (er) {
        if(er) {
          console.log("unable to find file");
          return cb(null, false);
        }
        cb(null, true);
      });
    },
    getManifestStream: (req, cb) => {
      const stream = fs.createReadStream(`${__dirname}/assets/${req.url}`);
      cb(null, stream);
    },
    getSegmentStream: (req, cb) => {
      const stream = fs.createReadStream(`${__dirname}/assets/${req.url}`);
      cb(null, stream);
    }
  }
});
// hlsServer.

// function getVideos() {
//   return fs.promises.readdir("./assets/video");
// }
