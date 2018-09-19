var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        name: "Sample Campground #1",
        image: "https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=c85daa025ee04c951b6ac12fe3ba031a&auto=format&fit=crop&w=750&q=80",
        description: "This is a great place to relax and enjoy and have fun with your family and friends!!!!!1!111"
    },
    {
        name: "Sample Campground #2",
        image: "https://images.unsplash.com/photo-1479741044197-d28c298f8c77?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=00a8cfc7aba62bd47f10abd96551cb1d&auto=format&fit=crop&w=750&q=80",
        description: "This is a great place to relax and enjoy and have fun with your family and friends!!!!!1!111"
    },
    {
        name: "Sample Campground #3",
        image: "https://images.unsplash.com/photo-1465695954255-a262b0f57b40?ixlib=rb-0.3.5&s=b95fc96bc1daca8c7cfbe4c7d3b03a19&auto=format&fit=crop&w=750&q=80",
        description: "This is a great place to relax and enjoy and have fun with your family and friends!!!!!1!111"
    }
];

function seedDB(){
    Campground.remove({},function(err){
        if(err){
            console.log(err);
        }
        // data.forEach(function(seed){
        //     Campground.create(seed, function(err,data){
        //         if(err){
        //             console.log(err);
        //         }
        //         else{
        //             Comment.create(
        //                 {
        //                     text: "Lovely place with great wifi!",
        //                     author: "John Smith"
        //                 }, function(err, comment){
        //                     if(err){
        //                         console.log(err);
        //                     }
        //                     else{
        //                         data.comments.push(comment);
        //                         data.save();  
        //                     }
        //                 }
        //             )
        //         }
        //     })
        // })
    })


}

module.exports = seedDB;