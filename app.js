var express    = require("express"),
    app        = express(),
    request    = require("request"),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    User       = require("./models/user"),
    Admin      = require("./models/admin"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment"),
    Events      = require("./models/events"),
    Booking    = require("./models/booking"),
    expressSanitizer= require("express-sanitizer"),
    passport   = require("passport"),
  LocalStrategy= require("passport-local"),
    async      = require("async"),
    nodemailer = require("nodemailer"),
    crypto     = require("crypto"),
    flash      = require("connect-flash"),
    request    = require("request"),
    shortid    = require("shortid"),
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
// mongoose.connect("mongodb://localhost/yelp_camp",option);
mongoose.connect("mongodb://bootbox:bootbox123@ds119853.mlab.com:19853/yelp_camp",option);
app.use(expressSanitizer());
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
app.use(flash());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.message = req.flash("error");
    next();
})
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

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
    Events.find({},function(err, event){
        if(err){
            console.log(err);
        }
        else{
            request('http://staging.api.insider.in/tag/list', function (error, response, body) {
                var content= JSON.parse(body);
                res.render("events",{events: event});

        });
        }
    });
});

app.get("/events/new",checkAdmin,function(req,res){
    res.render("newEvent");
});
app.post("/events/new",checkAdmin,function(req,res){
    var newEvent = {name: req.body.name,
                    image: req.body.image,
                    description: req.body.description,
                    longDescription: req.body.longDescription, 
                    duration: req.body.duration, 
                    rating: req.body.rating, 
                    availability: req.body.qty,
                    price: req.body.price};
    Events.create(newEvent,function(err,newevent){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/events");
        }
    });
});

app.get("/events/:id",function(req, res){
    Events.findById(req.params.id, function(err, result){
        if(err){
            console.log(err);
        }
        else{
            res.render("eventShow", {event: result});
        }
    });
});

app.post("/booking/:id",isLoggedIn,function(req,res){
    Events.findById(req.params.id,function(err,result){
        if(result.availability>=req.body.qty){
            result.availability= result.availability-req.body.qty;
            result.save();
        var pr= (req.body.qty*result.price)+(0.1*result.price);
        var bookingID= shortid.generate();
        var newBooking={
            title: result.name,
            qty: req.body.qty,
            price: pr,
            mrp: result.price,
            bookid: bookingID,
            booker: {id: req.user._id,
                     username: req.user.username
            },
        };
        Booking.create(newBooking,function(err,newbook){
            if(err){
                console.log(err);
            }
            else{
                res.render("booking",{booking: newbook});
            }
        });
    }else{
        res.redirect("back");
    }
    });
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

app.get("/policy", function(req, res){
    res.render("policy");
})

app.get("/terms", function(req, res){
    res.render("terms");
})

app.get("/admin",function(req,res){
    res.render("admin");
})
//====================AUTH ROUTES====================\\
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",function(req,res){
    var captcha = req.body["g-recaptcha-response"];
    if(!captcha) {
        return res.redirect("/register");
    }
    var secretKey = "6LdN9qAUAAAAANsQkFKn5zPxH1ZOOwsS-CwORZGN";
    //Verify Captcha URL
    let verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;

    //Make request to verify URL
    request.get(verifyURL, (err, response, body) => {
        //if not successful
        if(body.success !== undefined && !body.success) {
            return res.redirect("/register");
        }
    })
    var newUser = new User({username: req.body.username, email: req.body.email});
    if(req.body.adminCode === 'zxcvbnm'){
        newUser.isAdmin = true;
    }
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
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

app.get("/forgot",function(req,res){
    res.render("forgot");
});

app.post("/forgot",function(req,res){
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err,buf){
                var token= buf.toString('hex');
                done(err,token);
            });
        },
        function(token, done) {
            User.findOne({email: req.body.email}, function(err,user){
                if(!user){
                    req.flash("error", "No such account associated with given email address exists");
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken= token;
                user.resetPasswordExpires= Date.now() + 36000000;

                user.save(function(err){
                    done(err,token,user);
                });
            });
        },
        function(token,user,data) {
            var smtpTransport= nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'hatofperfection@gmail.com',
                    pass: process.env.pass,
                }
            });
            var mailOptions= {
                to: user.email,
                from: 'Bakuei ✔ <hatofperfection@gmail.com>',
                subject: 'bakuei password reset',
                text: 'Follow this link to reset your password. It will expire within 1 hour.\n'+
                      'http://'+req.headers.host+'/reset/'+token+'\n\n'
            };
            smtpTransport.sendMail(mailOptions,function(err){
                // alert("Password reset email has been sent to the requested email address.");
                // done(err,'done');
                res.redirect("sent");
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/forgot');
    })
});

app.get("/reset/:token",function(req,res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err,user){
        if(!user){
            return res.redirect("/forgot");
        }
        res.render('reset', {token: req.params.token});
    });
});

app.post("/reset/:token",function(req,res){
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err,user){
                if(!user){
                    console.log("ABA OA!")
                    req.flash("error", "Invalid or expired token!");
                    return res.redirect("back");
                }
                if(req.body.password==req.body.confirm){
                    user.setPassword(req.body.password, function(err){
                        user.resetPasswordExpires= undefined;
                        user.resetPasswordToken= undefined;

                        user.save(function(err){
                            req.logIn(user,function(err){
                                done(err,user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match");
                    return res.redirect('back');
                }
            });
        },
        function(user,done){
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'hatofperfection@gmail.com',
                    pass: process.env.pass,
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'hatofperfection@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n'+
                      'This is a confirmation that the password for your account has just been changed'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                // req.flash("success", "Success! Your password has been successfully changed!");
                done(err);
            });
        }
    ], function(err){
        res.redirect("/index");
    });
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
app.get("/sent",function(req,res){
    res.render("sent");
})
app.put("/index/:id/edit",checkOwner, function(req,res){
    Campground.findById(req.params.id,function(err,cg){
        if(err){
            console.log(err);
        }
        else{
            cg.name = req.body.name;
            cg.image = req.body.image;
            cg.description = req.body.description;
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

app.get("/index/:id/:cid/edit",checkCommentOwner, function(req,res){
    Campground.findById(req.params.id,function(err,cg){
        Comment.findById(req.params.cid,function(err,comment){
            res.render("editComment",{campground: cg, comment: comment});
        });
    });
});

app.put("/index/:id/:cid/edit",checkCommentOwner, function(req,res){
    newComment = {text: req.body.comment};
    Comment.findByIdAndUpdate(req.params.cid, newComment, function(err, updated){
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

// BLOG

app.get("/blogs",function(req,res){
    Blog.find({}, function(err,blog){
        if(err){
            console.log(err);
        }
        else{
            res.render("blog/index",{blog: blog, user: req.user});
        }
    })
});
app.get("/blogs/new",checkAdmin, function(req,res){
    res.render("blog/new", {user: req.user});
});

app.post("/blogs",checkAdmin, function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, blog){
        if(err){
            res.render("blog/new", {user: req.user});
        }
        else{
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("blog/show", {blog: blog, user: req.user});
        }
    });
});

app.get("/blogs/:id/edit",checkAdmin, function(req,res){
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            res.send("ERROROROROR");
        }
        else{
            res.render("blog/edit", {blog: blog, user: req.user});
        }
    });
});

app.put("/blogs/:id",checkAdmin,  function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

app.delete("/blogs/:id",checkAdmin, function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs",{ user: req.user});
        }
        else{
            res.redirect("/blogs",{ user: req.user});
        }
    })
});
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
                if(cg.author.id.equals(req.user._id) || req.user.isAdmin){
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
                if(com.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    }
}

function checkAdmin(req,res,next){
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            next();
        }
        else
            res.redirect("back");
    }
}
var port = process.env.PORT || 3000;
app.listen(port,"0.0.0.0",function(){
    console.log("its running");
});