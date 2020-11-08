var express = require("express");
var app = express();
app.set("view engine", "ejs"); 
var mys = require("mysql");
var port = process.env.PORT || 1234;
var conn = mys.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'priyam',
    database: 'exam'
});
conn.connect(err => {
    if(err){
        console.log(err)
        return err;
    }
})

var query = "SELECT * FROM Teachers;"
app.get("/", function(req,res){
    res.render("login");
});

app.get("/a",function(req,res){
    conn.query(query,(err, results) =>{
        if(err){
            return res.send(err);
        }
        else{
            return res.json({
                data: results
            })
        }
    })
    conn.end()
});



app.listen(port,process.env.IP,function(){
    console.log("Server Running on 1234",port);
})