var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var path = require('path');
var bodyParser = require('body-parser');
const mong = require('mongodb');
var mongo = mong.MongoClient;
var cookieparser = require('cookie-parser');
var session= require('express-session');

var hab = exphbs.create({defaultLayout:'main',
extname:'.hbs'
});

app.listen(3000,()=>{
    console.log('started');
});


var questions=[];
var age = 1000*60*30;


//passwords for accessing the servers
//use admin and admin to access the answers page
var users=["aniket", "ram", "shyam"];
var pwd = ["1234","5678","9101"];


app.engine('.hbs',hab.engine);
app.set('view engine', '.hbs');
//app.use('/data',db);
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('views'));
app.use(session({
    secret:'025##46',resave:false, saveUninitialized:true, cookie:{maxAge:age}
}));

app.get('/',(req,res)=>{
    res.redirect('/login');
});

app.get('/login',(req, res)=>{
    if(!req.session.user)
        res.render('login');
    else if(req.session.user =="admin")
        res.redirect('/answer');
    else
        res.redirect('/add');

});
app.post('/login',(req,res)=>{
    let user = req.body.user;
    let password = req.body.password;
    if(user == "admin" && password == "admin")
    {
        req.session.user=user;
        res.redirect('/answer');
    }
    else if(users.indexOf(user)>-1&&users.indexOf(user)==pwd.indexOf(password))
    {
        req.session.user=user;
        res.redirect('/add');
    }
    else
    res.send("Wrong Credentials");
});

app.post('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/login');
});

app.get('/add',(req,res)=>{
    if(req.session.user)
    {
    var stat= req.query.status;
    //res.render('add',{title:"Add",st:stat});
    
    mongo.connect(url,(err,client)=>{
        var db=client.db('mydb');
        var cursor = db.collection("students").find({user:req.session.user});
        questions=[];

        cursor.forEach((doc,err) => {
            //qid.push(doc.questionId);
            questions.push(doc);
        },()=>{
            client.close();
            //console.log(questions);
            res.render('add',{title:"Add",questions:questions,st:stat});

        });
    });
}
else res.redirect("/login");
});

app.get('/answer',(req,res)=>{
    if(req.session.user=="admin")
    {
    var stat = "";
    stat = req.query.status;

    var resultArray;
    
    mongo.connect(url,(err,client)=>{
        var db=client.db('mydb');
        var cursor = db.collection("students").find();
        questions=[];

        cursor.forEach((doc,err) => {
            //qid.push(doc.questionId);
            questions.push(doc);
        },()=>{
            client.close();
            //console.log(questions);
            res.render('answers',{title:"Answer",questions:questions,st:""});

        });
    });
} else res.redirect("/login");
});

app.post('/answer',(req,res)=>{
    if(req.session.user=="admin"){
    var id=new mong.ObjectId(req.body.question);
    var Answer=req.body.ans;
    //console.log(`Question: ${question}\nAnswer: ${Answer}`);
    if(Answer!=""){
    mongo.connect(url,(err,client)=>{
        if(err)
            throw err;
        var db=client.db("mydb");
        var find={_id:id};
        var newValues = {$set: {isAnswered:true,answer:Answer}};
        db.collection("students").updateOne(find, newValues, function(err, es) {
            if (err) throw err;
            console.log("1 document updated");  
        });
        client.close();
    });
    //res.render('answers',{title:"Answer",questions:questions,st:"Successful"});
}
    //else
    //res.render('answers',{title:"Answer",questions:questions,st:"Unsuccessful"});
    res.redirect('/answer');
}
else res.redirect("/login");
});

app.post('/add',(req,res)=>{
    if(req.session.user){
    var question=req.body.question;
    var user=req.session.user;
    if(question!=""){
    //`console.log(`Question: ${question}`);

    mongo.connect(url,(err,client)=>{
        if(err)
            throw err;
        var db=client.db("mydb");
        var query = {user:user,question:question,isAnswered:false,answer:""};
        db.collection("students").insertOne(query,(err,es)=>{
            if(err) throw err;
            console.log("1 document inserted");
        });
        client.close();
    });
    //res.render('add',{title:"Add",questions:questions,st:"Successful"});
    }
    //else res.render('add',{title:"Add",questions:questions,st:"Unsuccessful"});
    res.redirect('/add');
} else res.redirect('/login');
});



//var url = "mongodb+srv://test_accou:Iamaniket123@edutechtest-hhx6s.mongodb.net/test?retryWrites=true&w=majority";
var url = "mongodb://127.0.0.1:27017"

mongo.connect(url,(err,db)=>{
    if(err)
        throw err;
    else{
        console.log("Connected");
    }
    db.close();
});
