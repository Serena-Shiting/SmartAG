const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-serena:20081155@cluster0.qvpsc.mongodb.net/IoTDB", { useNewUrlParser: true });


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
  datetime: String,
  temperature: Number,
  humidity: Number,
});

const Data = mongoose.model('Data', DataSchema, 'weather_data');
const SoilData = mongoose.model('SoilData', SoilDataSchema, 'soil_data');

app.get("/", function(req, res) {

  Data.find({},function(err, foundDatas){
    if(err){
      console.log(err);
    }else{
      console.log(foundDatas.length);
      res.render("home", {foundDatas: foundDatas[foundDatas.length-1]});
    }
  })
});

app.get("/soil", function(req, res) {

  SoilData.find({},function(err, foundSDatas){
    if(err){
      console.log(err);
    }else{
      console.log(foundSDatas.length);
      res.render("soil", {foundDatas: foundSDatas[foundSDatas.length-1]});
    }
  })
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
