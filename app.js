var express    = require("express"),
    app        = express(),
    request    = require("request"),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    User       = require("./models/user"),
    Admin      = require("./models/admin"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment"),
    Event      = require("./models/events"),
    passport   = require("passport"),
  LocalStrategy= require("passport-local"),
    // Comment    = require("./models/comment"),
    // User       = require("./models/user"),
    seedDB     = require("./seeds");
    methodOverride = require("method-override")

    // seedDB();
    const option = {
        socketTimeoutMS: 30000,
        keepAlive: true,
        reconnectTries: 30000
    };
mongoose.connect("mongodb://localhost/yelp_camp",option);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(require("express-session")({
    secret: "toppestest cigarette dont read plz",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
})
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("landing");
});
app.get("/index",function(req,res){
    Campground.find({},function(err, cg){
        if(err){
            console.log(err);
        }
        else{
            res.render("index",{campgrounds: cg});
        }
    });
    
});
app.post("/index",isLoggedIn,function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var lat = req.body.lat;
    var long = req.body.long;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image,description: description,lat: lat,long: long,author: author};
    Campground.create(newCampground,function(err,newcg){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/index");
        }
    });
});
app.get("/index/new",isLoggedIn,function(req,res){
    res.render("new");
});
app.get("/index/:id",function(req,res){
    // var id= "ObjectId(\""+req.params.id+"\")";
    Campground.findById(req.params.id).populate("comments").exec(function(err, result){
        if(err){
            console.log(err);
        }
        else{
            res.render("show", {campground: result});
        }
    });
});
app.post("/index/:id/newComment",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,cg){
        if(err){
            console.log(err);
        }
        else{
            Comment.create(req.body.comment,function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    cg.comments.push(comment);
                    cg.save();
                    res.redirect("/index/"+req.params.id+"/#comments");
                }
            })
        }
    })
})

app.get("/events",function(req,res){
    res.render("events");
});

app.post("/search",function(req,res){
    var search = req.body.search;
    var regex = new RegExp(search,"i")
    Campground.find({'name':regex},function(err,cgs){
        if(err){
            console.log(err);
        }
        else{
            res.render("search",{results: cgs});
        }
    });
});

app.get("/admin",function(req,res){
    res.render("admin");
})
//====================AUTH ROUTES====================\\
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",function(req,res){
    User.register(new User({username: req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/index");
        });
    });
});

app.get("/login",isNotLoggedIn,function(req,res){
    res.render("login");
});
app.post("/login",isNotLoggedIn,passport.authenticate("local",{ 
    successRedirect: "/index",   
    failureRedirect: "/login"
}),
    function(req,res){

});

app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/index");
});

app.get("/index/:id/edit",checkOwner, function(req,res){
    Campground.findById(req.params.id,function(err,cg){
        if(err){
            console.log(err);
        }
        else{
            res.render("edit",{campground: cg});
        }
    });
});

app.put("/index/:id/edit",checkOwner, function(req,res){
    Campground.findById(req.params.id,function(err,cg){
        if(err){
            console.log(err);
        }
        else{
            cg.name = req.body.name;
            cg.image = req.body.image;
            cg.description = req.body.description;
            cg.lat = 26.912434;
            cg.long = 75.787270;
            cg.price = 200;
            cg.save();
            res.redirect("/index/"+req.params.id);
        }
    });
});

app.delete("/index/:id/delete",checkOwner, function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err,cg){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/index");
        }
    })
});

app.put("/index/:id/:cid",checkCommentOwner, function(req,res){
    Comment.findByIdAndUpdate(req.params.cid, req.body.comment, function(err, updated){
        if(err){
            res.redirect("/index");
        }
        else{
            res.redirect("/index/"+req.params.id);
        }

    })
})

app.delete("/index/:id/:cid", checkCommentOwner, function(req,res){
    Comment.findByIdAndRemove(req.params.cid,function(err,com){
        if(err){
            res.redirect("/index");
        } else {
            res.redirect("/index/"+req.params.id);
        }
    })
})
function isLoggedIn(req,res,next){
    if(req.user){
        next();
    }
    else
    res.redirect("/login");
}
function isNotLoggedIn(req,res,next){
    if(!req.user){
        next();
    }
    else
    res.redirect("/index");
}

function checkOwner(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err,cg){
            if(err){
                res.redirect("/index");
            } else {
                if(cg.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.send("You do not have permission to do that!");
                }
            }
        })
    } else {
        res.redirect("back");
    }
}

function checkCommentOwner(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.cid,function(err, com){
            if(err){
                res.redirect("back");
            } else {
                if(com.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    }
}
app.listen(3001,function(){
    console.log("its running");
});