const express = require('express');

const bodyParser = require('body-parser');

const multer = require('multer');

const path = require('path');

const app = express();

const fs = require('fs');

const mongodb = require('mongodb');
//use middleware of bodyparser

app.use(bodyParser.urlencoded({extended:true}))

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads')
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})


var upload = multer({
    storage:storage
})

//configuring mongodb

const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url,{
    useUnifiedTopology:true,useNewUrlParser:true
},(err,client) => {
    if(err) return console.log(err);
    
    db = client.db('Images');

    app.listen(3000,() => {
        console.log("MongoDb server listening at 3000");
    })
})

//configuring the home routes  

app.get('/',(req,res) => {
    res.sendFile(__dirname + '/index.html');
})

//configuring the upload image
app.post("/uploadphoto", upload.single('myphoto'),(req,res) => {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');

    //define JSON
    var finalImg = { 
        contentType:req.file.mimetype,
        path:req.file.path,
        image: new Buffer(encode_image,'base64')
    }; 

    //inset the image in db
    db.collection('image').insertOne(finalImg,(err,result) =>{
        console.log(result);

        if(err) return console.log(err);

        console.log("Saved");

        res.contentType(finalImg.contentType);

        //res.send(finalImg.image);
        console.log("Welcome back");
        res.end();
    })
})


app.listen(5000,() => {
    console.log("Server is listening on port number 5000");
})