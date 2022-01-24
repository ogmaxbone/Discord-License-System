const express = require("express");
const app = express();
const port = 80;
var cors = require("cors");
const bodyParser = require("body-parser");
var fs = require("fs");
const { Webhook, MessageBuilder } = require("discord-webhook-node");

var Datastore = require("nedb");
const database = new Datastore("keys.db");

var settings = JSON.parse(fs.readFileSync("./settings.json"));

const hook = new Webhook(settings["webhook"]);
const adminID = settings["admin"];
const keyPassword = settings["password"];

app.use(cors());
app.use(bodyParser.json());
database.loadDatabase();

function generate(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678901234567890";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.post("/key/generate/lifetime", (req, res) => {
  if (req.body.password === keyPassword) {
    if (req.body.client === adminID) {
      var date = new Date();
      var key =
        generate(6) + "-" + generate(6) + "-" + generate(6) + "-" + generate(6);
      database.insert({
        key: key,
        type: "lifetime",
        ipAddress: "",
        clientId: "",
        created: date.toLocaleString(),
      });
      res.status(200).send({ status: "Generated" });
      var keyEmbed = new MessageBuilder()
        .setTitle("**Key Generated**")
        .addField("Type", "Lifetime")
        .addField("Key", `||${key}||`)
        .setColor("#585858")
        .setTimestamp();
      hook.send(keyEmbed);
      return date;
    }
  } else {
    res.status(403).send({ status: "failed" });
  }
});

app.post("/user/auth", async (req, res) => {
  database.find({ key: req.body.user }, function (err, docs) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    var auth = JSON.stringify(docs);

    if (auth.includes(req.body.user)) {
      var ipCheck = JSON.parse(auth);
      var ipFind = ipCheck[0]["ipAddress"];
      if (ipFind === "") {
        database.update(
          { key: req.body.user },
          { $set: { ipAddress: ip } },
          {},
          function (err, numReplaced) {}
        );
        console.log(`User ${req.body.user} logged in`);
        res.status(200).end();
      } else if (ipFind === ip) {
        console.log(`User ${req.body.user} logged in`);
        res.status(200).end();
      }
    } else if (ipFind !== ip) {
      res.status(403).end();
    } else {
      res.status(403).end();
    }
  });
});

app.post("/user/key/bind", async (req, res) => {
  database.find({ key: req.body.user }, function (err, docs) {
    var auth = JSON.stringify(docs);
    console.log(req.body.client);
    if (auth.includes(req.body.user)) {
      var bindCheck = JSON.parse(auth);
      var clientFind = bindCheck[0]["clientId"];
      if (clientFind === "") {
        database.update(
          { key: req.body.user },
          { $set: { clientId: req.body.client, avatar: req.body.avatar } },
          {},
          function (err, numReplaced) {}
        );
        res.status(200).send({ status: "binded" });
      }
    } else {
      res.status(403).send({ status: "failed" });
    }
  });
});
app.post("/user/key/unbind", async (req, res) => {
  database.find({ key: req.body.user }, function (err, docs) {
    var auth = JSON.stringify(docs);
    if (auth.includes(req.body.user)) {
      var bindCheck = JSON.parse(auth);
      var clientFind = bindCheck[0]["clientId"];
      if (clientFind === req.body.client) {
        database.update(
          { key: req.body.user },
          { $set: { clientId: "" } },
          {},
          function (err, numReplaced) {}
        );
        res.status(200).send({ status: "unbinded" });
      }
    } else {
      res.status(403).send({ status: "failed" });
    }
  });
});
app.post("/user/key/reset", async (req, res) => {
  database.find({ key: req.body.user }, function (err, docs) {
    var auth = JSON.stringify(docs);
    if (auth.includes(req.body.user)) {
      var bindCheck = JSON.parse(auth);
      var clientFind = bindCheck[0]["clientId"];
      if (clientFind === req.body.client) {
        console.log(req.body.avatar);
        database.update(
          { key: req.body.user },
          { $set: { ipAddress: "", avatar: req.body.avatar } },
          {},
          function (err, numReplaced) {}
        );
        res.status(200).send({ status: "reset" });
      }
    } else {
      res.status(403).send({ status: "failed" });
    }
  });
});

app.post("/user/key/status", async (req, res) => {
  database.find({ clientId: req.body.client }, function (err, docs) {
    var auth = JSON.stringify(docs);
    if (auth.includes(req.body.client)) {
      var status = JSON.parse(auth);
      res.status(200).send({ key: status });
    } else {
      res.status(403).send({ status: "failed" });
    }
  });
});

app.listen(port, function () {
  console.log("server running at 80");
});
