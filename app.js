var express = require("express");
var app = express();
app.set("view engine", "ejs"); 
var mys = require("mysql");
var port = process.env.PORT || 1234;
var bodyParser = require("body-parser");
var passport = require("passport");
var passportLocal = require("passport-local");
var User = require("./model/user");
var flash = require('connect-flash');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(require("express-session")({
    secret: "who are you",
    resave: false,
    saveUninitialized: false
}))
User(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
var conn = mys.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'priyam',
    database: 'onl',
    multipleStatements: true
});
conn.connect(err => {
    if(err){
        console.log(err)
        return err;
    }
    else{
        console.log("Database Connected")
    }
})

var query = "SELECT * FROM Teachers;"
app.get("/", function(req,res){
    res.render("home");
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

app.get("/loginstu", function(req,res){
    res.render("loginstu", {message: req.flash('loginMessage')});
});

app.post("/loginstu", passport.authenticate("local-loginstu", {
    successRedirect: "/studash",
    failureRedirect: "/loginstu",
    failureFlash: true
}), function(req,res){
    console.log(req.user)
});


app.get("/studash", isLoggedIn, function(req,res){
    var query = "select * from course c inner join stucou sc on sc.c_id = c.id inner join student s on s.id = sc.s_id where sc.s_id = ?;"
    conn.query(query, req.user.s_id,(err, results) =>{
        if(err){
            return res.send(err);
        }
        else{
            // console.log(results)
            return res.render("studash", {results: results})
        }
    })
});

app.get("/studash/:id", isLoggedIn, function(req,res){
    var query = "select * from gradedcom g inner join exam e on g.id = e.g_id inner join student s on s.id = e.s_id where e.s_id = ? and g.c_id = ?; select * from course c inner join gradedcom g on g.c_id=c.id where c.id = ?;select * from student where id = ?;select * from course where id = ?;"
    conn.query(query, [req.user.s_id,req.params.id,req.params.id,req.user.s_id,req.params.id],(err,results) =>{
        if(err){
            return res.send(err);
        }
        else{
            console.log(results[1][0])
            return res.render("showstu", {results: results})
        }
    })
});

app.get("/:id/giveexam", isLoggedIn, function(req,res){
    var query = "Select * from question where g_id = ?; select *,g.id from course c inner join gradedcom g on g.c_id = c.id where g.id = ?; select * from student where id = ?;"
    conn.query(query,[req.params.id,req.params.id,req.user.s_id],(err,results) =>{
        if(err){
            return res.send(err);
        } else{
            // console.log(results)
            return res.render("giveexam", {results: results, user:results[2][0],gid: req.params.id})
        }
    })
})

app.post("/:id/giveexam", isLoggedIn, function(req,res){
    for(i=1;i<=req.body.nofque; i++){
        console.log("hhhh");
        var a = "";
    if(!(req.body["answer"+i])){
        a = "Not Answered";
    }
    else if(req.body["qtype"+i] != "mcq"){
        a = req.body["answer" + i];
    }
    else{
        for(j=0;j<req.body["answer"+i].length;j++){
        a = a + req.body["answer"+i][j]+";";
        }
    }
    console.log(a);
    conn.query("Insert into answer(g_id, s_id, q_id, ans) values(?,?,?,?);",[req.params.id,req.user.s_id,req.body["qid"+i],a],(err,results)=>{
        if(err){
            return res.send(err);
        }
    });  
    }
    conn.query("Insert into exam(s_id, g_id, maxm) values(?,?,?);",[req.user.s_id,req.params.id,req.body.maxm],(err,results)=>{
        if(err){
            return res.send(err);
        }
    });  
    conn.query("Update gradedcom set is_attempted = 0 where id =?",req.params.id);    
    console.log(req.body)
    return res.redirect("/edone")
});

app.get("/edone",isLoggedIn, function(req,res){
    res.render("edone")
})

app.get("/:id/view", isLoggedIn, function(req,res){
    var query = "select * from answer a inner join question q on q.id=a.q_id where a.g_id = ? and a.s_id =  ?; select * from gradedcom g inner join exam e on e.g_id=g.id where g.id = ? and e.s_id = ?;select * from student where id = ?;"
    conn.query(query, [req.params.id,req.user.s_id,req.params.id,req.user.s_id,req.user.s_id],(err,results) =>{
        if(err){
            return res.send(err);
        }
        else{
            // console.log(results)
            return res.render("viewans", {results: results})
        }
    })
});
app.get("/teadash", isLoggedIn, function(req,res){
    var query = "select c.id,c.cname,c.t_id, c.credit, t.name,t.designation from course c inner join teacher t on t.id = c.t_id where c.t_id = ?;"
    conn.query(query,req.user.t_id,(err, results) =>{
        if(err){
            return res.send(err);
        }
        else{
            // console.log(results)
            return res.render("teadash", {results: results})
        }
    })
});

app.get("/teadash/:id", isLoggedIn, function(req,res){
    var query = "Select c.id, t.name,t.designation, c.cname from course c inner join teacher t on c.t_id = t.id where t.id = ? and c.id = ?; select * from gradedcom where c_id = ?;"
    conn.query(query, [req.user.t_id,req.params.id,req.params.id],(err,results) =>{
        if(err){
            return res.send(err);
        }
        else{
            console.log(results)
            return res.render("showtea", {results: results})
        }
    })
});

app.get("/:id/createexam", isLoggedIn, function(req,res){
    conn.query("select * from teacher where id = ?;",req.user.t_id,(err,results)=>{
        if(err){
            return res.send(err);
        }
        else{
    res.render("createexam",{id:req.params.id , results:results});
        }
    })
});

app.post("/:id/createexam", isLoggedIn, function(req,res){
    conn.query("Insert into gradedcom( nofque, maxm, time, c_id, t_id, ename, is_graded, is_attempted) values (" + req.body.no_of_que + "," + req.body.maxm + ","+ req.body.time + "," + req.params.id + "," + req.user.t_id + ",?" + ","+0+","+1+ ");",req.body.ename,(err,results) =>{
        if(err){
            return res.send(err);
        }
        else{
            // console.log(req)
            return res.redirect("/createexam/exfo/"+req.params.id+"/"+req.body.ename)
        }
    })
})

app.get("/createexam/exfo/:cid/:id", isLoggedIn, function(req,res){
    var query = "select * from gradedcom where ename = ? and c_id = ? ;select * from teacher where id = ?;"
    conn.query(query, [req.params.id,req.params.cid,req.user.t_id],(err,results) =>{
        if(err){
            return res.send(err);
        }
        else{
            // console.log(results)
            return res.render("exfo", {results: results})
        }
    })
})

app.post("/createexam/exfo/:id/:noq", isLoggedIn, function(req,res){
    for(var i =1;i<= req.params.noq; i++){
        if(req.body.questype[i-1]=="mcq" || req.body.questype[i-1]=="ocq"){
        conn.query("Insert into question(type,que,mm,opt1,opt2,opt3,opt4,g_id) values(?,?,?,?,?,?,?,"+req.params.id+");",[req.body.questype[i-1],req.body["ques"+i],req.body["ques"+i+"mm"],req.body["ques"+i+"op1"],req.body["ques"+i+"op2"],req.body["ques"+i+"op3"],req.body["ques"+i+"op4"]],(err,results) =>{
            if(err){
                return res.send(err);
            }
            else{
                // console.log(req.body)
            }
    })
                }
        else {
            conn.query("Insert into question(type,que,mm,g_id) values(?,?,?,"+req.params.id+");",[req.body.questype[i-1],req.body["ques"+i],req.body["ques"+i+"mm"]],(err,results) =>{
        if(err){
            return res.send(err);
        }
        else{
            // console.log(req.body)
        }

})
}
    }
    return res.redirect("/teadash")
});
app.get("/:id/checkexam", isLoggedIn, function(req,res){
    var query = "select s.name,s.roll,e.s_id,e.id,e.mar,e.maxm from student s inner join exam e on s.id = e.s_id where e.g_id = ?; select * from gradedcom g inner join course c on g.c_id = c.id where g.id = ?;select * from teacher where id = ?;";
    conn.query(query, [req.params.id,req.params.id,req.user.t_id],(err,results) =>{
        if(err){
            return res.send(err);
        }
        else{
            console.log(results)
            return res.render("checkexamlist", {results: results, id:req.params.id})
}
})
})
app.get("/:id/:sid/checkexam", isLoggedIn, function(req,res){
    var query = "select * from answer a inner join question q on q.id=a.q_id where a.g_id = ? and a.s_id =  ?; select * from gradedcom where id = ?;select * from teacher where id = ?;select * from student where id = ?;";
    conn.query(query, [req.params.id,req.params.sid,req.params.id,req.user.t_id,req.params.sid],(err,results) =>{
        if(err){
            return res.send(err);
        }
        else{
            // console.log(results[1])
            return res.render("checkexam", {results: results,id:req.params.sid})
}
})
    });

app.post("/:id/:sid/checkexam", isLoggedIn, function(req,res){
    for(i=1;i<=req.body.noq;i++){
    conn.query("update answer set mar = ? where q_id = ? and s_id = ?;",[req.body["mq"+i],req.body["qid"+i],req.params.sid]);
    conn.query("update answer set comment = ? where q_id = ? and s_id = ?;",[req.body["cq"+i],req.body["qid"+i],req.params.sid]);
    conn.query("update exam set mar = ? where s_id = ? and g_id = ?;",[req.body.total,req.params.sid,req.params.id]);
    conn.query("update gradedcom set is_graded = 1 where id =  ?;",req.params.id)
    }
    // console.log(req.body);
    res.redirect("/"+req.params.id+"/checkexam");
});

app.get("/login", function(req,res){
    res.render("login", {message: req.flash('loginMessage')});
});

app.post("/login",passport.authenticate("local-login", {
    successRedirect: "/teadash",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res){
    console.log(req.body)
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}



app.listen(port,process.env.IP,function(){
    console.log("Server Running on 1234",port);
})