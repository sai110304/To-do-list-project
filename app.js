const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// const items = ["Eat"];
// const workItems = [];

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser: true});



const  itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your todoList!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item"
});

const item3 = new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems = [item1, item2 , item3];




const ListSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", ListSchema);




app.get('/', function(req, res){

  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems).then(()=>{
        console.log("Successfully added to database");
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle:"Today" ,newListItems:foundItems});
    }
  });
  //const day=date.getDate(); // or use getDay as you want
});



app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then((foundList)=>{
    if(!foundList){
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save().then(()=>{
            res.redirect("/"+ customListName);
          });

    } else {
          console.log("Exists");
          res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
    }
  });
});




app.post('/',function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name:itemName
    })

    if(listName === "Today"){
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}).then((foundList)=>{
        foundList.items.push(item);
        foundList.save().then(()=>{
          res.redirect("/"+ listName);
        })
      })
    }
    // const item = req.body.newItem;
    // if(req.body.list === "Work"){
    //   workItems.push(item);
    //   res.redirect("/work");
    // }
    // else{
    //   items.push(item);
    //   res.redirect("/");
    // }
})




app.post('/delete',async function (req,res) {
  const checkeditemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    let product = await Item.findByIdAndRemove(checkeditemId).then(()=>{
      res.redirect("/");
      // console.log(product);
      // res.redirect('/');
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull :{items:{_id:checkeditemId}}}).then((foundList)=>{
      foundList.save().then(()=>{
        res.redirect("/"+ listName);
      })
    })
  }


});


// app.get('/work',function(req,res){
//
//   res.render("list",{listTitle:"Work List", newListItems:workItems});
// })
//
// app.post("/work",function(req,res){
//   const item=req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// })


app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on port 3000.");
});
