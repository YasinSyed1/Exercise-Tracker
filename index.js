const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const e = require('express');
const bodyParser = require('body-parser');
// --------------------------------------------------------------

app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const userSchema = {
  "username": {type: String, required: true},
  "count": {type: Number, required: true},
  "log":[
    { "description": {type: String, required: true},
      "duration": {type: Number, required: true},
      "date": {type: String, required: true}}
  ]
};

var user = mongoose.model('user', userSchema);

app.post("/api/users", (req, res) => {
  const userName = req.body.username
  console.log("---------------------------------")

  // console.log("username",userName)
  // if(userName == ""){console.log("NUll")}
  // res.json({"username": userName, "_id":id})

  var newUser = new user({username: userName, count: 0 , log: []});
  newUser.save((err, data) => {
    if(err || (userName == "")) return res.send(err);
    // console.log(data)
    // console.log("---------------------------------")
    return res.json({"username": userName,"_id":data._id});
    });
});



app.get("/api/users", (req, res) => {
  user.find({}, (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});


  // {
  //   username: "fcc_test",
  //   description: "test",
  //   duration: 60,
  //   date: "Mon Jan 01 1990",
  //   _id: "5fb5853f734231456ccb3b05"
  // }

app.post("/api/users/:_id/exercises", (req, res) => {
  var _id = req.params._id;
  var description = req.body.description;
  var duration = req.body.duration;
  var date = req.body.date;
  // console.log(_id)
  // console.log(description)

  json_obj = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  user.findOne({_id: _id}, (err, data) => {
    if (err || (data == null)){return res.send(err)}
    else{
      data.log.push(json_obj);
      data.save((err, data) => {
        if (err) return res.send(err)
        return
      });


      res.json({
        _id: _id,
        username: data.username,
        date: date ? new Date(date).toDateString() : new Date().toDateString(),
        duration: parseInt(duration),
        description: description
    });
    }
  });
});



app.get("/api/users/:_id/logs?",(req,res) => {
  var _id = req.params._id

  const fromDate = new Date(req.query.from);
  const toDate = new Date(req.query.to);
  const limit = parseInt(req.query.limit);

  user.findOne({_id: _id}, (err, data) => {
    if(err) return err
    else{
      console.log(data.log)
      var log_json = []

      data.log.filter(exercise =>
      new Date(Date.parse(exercise.date)).getTime() > fromDate
      && new Date(Date.parse(exercise.date)).getTime() < toDate
      )


      for(var i = 0;i<(data.log).length;i++){
        var des = (data.log[i].description)
        log_json.push({"description":des,"duration":data.log[i].duration,"date":data.log[i].date})
      }
      // console.log("log_json", log_json)

      if(limit){
        log_json = log_json.slice(0,limit)
      }

      // console.log(log_json)
      return res.json({"_id":data._id,"username":data.username,"count":data.__v,"log":log_json})
    }
  });
});


// ----------------------------------------------------------------------------
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
