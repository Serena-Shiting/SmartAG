const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-serena:20081155@cluster0.qvpsc.mongodb.net/IoTDB", {
  useNewUrlParser: true
});


const DataSchema = mongoose.Schema({
  datetime: String,
  wind_direction: Number,
  wind_speed: Number,
  gust: Number,
  temperature: Number,
  humidity: Number,
  total_rainfall: Number,
  hourly_rainfall: Number,
  daily_rainfall: Number,
  light_intensity: Number,
  UV_intensity: Number,
  UV_index: Number,
  power: Number,
  signal: Number,
  signal_intensity: Number,
  num_successes: Number
});

const SoilDataSchema = mongoose.Schema({
  datetime: Date,
  temperature: Number,
  humidity: Number,
});

const WeatherData = mongoose.model('Data', DataSchema, 'weather_data');
const SoilData = mongoose.model('SoilData', SoilDataSchema, 'soil_data');

app.get("/", function(req, res) {

  WeatherData.find({}, function(err, foundDatas) {
    if (err) {
      console.log(err);
    } else {
      console.log(foundDatas.length);
      res.render("home", {
        foundDatas: foundDatas[foundDatas.length - 1]
      });
    }
  })
});

app.get("/soil", function(req, res) {

  SoilData.find({}, function(err, foundSDatas) {
    if (err) {
      console.log(err);
    } else {
      console.log(foundSDatas.length);
      const tempDic = {};

      res.render("soil", {
        foundDatas: foundSDatas[foundSDatas.length - 1]
      });
    }
  })
});

  app.get("/:typename", function(req, res) {
    //num+datatype
    //00:soil_data
    //01:weather_data
    const typename = _.lowerCase(req.params.typename);

    if(typename.substring(0,2) === "00"){ // soil_data
      type = "$"+typename.substr(3)
      const tempDic = {};
      //, min: { $minute: "$datetime"}
      //+ ("0" + found[i]._id.min).slice(-2).toString()
      SoilData.aggregate( [ { $group: { _id:{ day: { $dayOfYear: "$datetime"}, hour: { $hour: "$datetime"} }, avgtemp: { $avg: "$"+typename.substr(3) } } } ], function(err, found) {
        //get {day hour mins: avg of temperature}
        for (var i = 0; i < found.length; i++) {
          const data = ("0" + found[i]._id.day).slice(-3).toString() + ("0" + found[i]._id.hour).slice(-2).toString()
          tempDic[data] = found[i].avgtemp
        }

        //sorted the dic by datetime
        const sortedDic = Object.keys(tempDic)
          .sort()
          .reduce((accumulator, key) => {
            accumulator[key] = tempDic[key];
            return accumulator;
        }, {});

        const timeList = Object.keys(sortedDic);
        const tempList = Object.values(sortedDic);

        res.render("lineChart", {
          timeList: timeList,
          dataList: tempList,
          datetype: typename.substr(3),
          sensor: "Soil Sensor"
        });
      }) //end of aggregate
    }else if(typename.substring(0,2) === "01"){ //weather_data
      type = "$"+typename.substr(3)
      const tempDic = {};

      //, min: { $minute: "$datetime"}
      //+ ("0" + found[i]._id.min).slice(-2).toString()
      WeatherData.aggregate( [ { $group: { _id:{ day: { $dayOfYear: "$datetime"}, hour: { $hour: "$datetime"} }, avgtemp: { $avg: "$"+typename.substr(3) } } } ], function(err, found) {
        //get {day hour mins: avg of temperature}
        for (var i = 0; i < found.length; i++) {
          const data = ("0" + found[i]._id.day).slice(-3).toString() + ("0" + found[i]._id.hour).slice(-2).toString()
          tempDic[data] = found[i].avgtemp
        }

        //sorted the dic by datetime
        const sortedDic = Object.keys(tempDic)
          .sort()
          .reduce((accumulator, key) => {
            accumulator[key] = tempDic[key];
            return accumulator;
        }, {});

        console.log(sortedDic);
        const timeList = Object.keys(sortedDic);
        const tempList = Object.values(sortedDic);

        res.render("lineChart", {
          timeList: timeList,
          dataList: tempList,
          datetype: typename.substr(3),
          sensor: "Weather Sensor"
        });
      }) //end of aggregate
    }

  });


  app.get("/both", function(req, res) {

      res.render("both");
  });

//For Deploying the website to Heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);

app.listen(port, function() {
  console.log("Server has started successfully！");
});
