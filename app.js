const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://svss14113:test-123@cluster0.vf3s2kt.mongodb.net/todoListDB",{useNewUrlParser: true});
/////////////////////////////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////////////////////
const ListSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", ListSchema);
///////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/', function(req, res){
  List.find({}).then(function(foundlists){
      console.log(foundlists.length);
      res.render("listnames", {listTitle:"Lists" ,newListItems:foundlists});
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then((foundList)=>{
    if(!foundList){
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save().then(()=>{
            res.redirect("/");
          });
    } else {
          console.log("Exists");
          res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
    }
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/',function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name:itemName
    })
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save().then(()=>{
        res.redirect("/"+ listName);
      })
    })
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/LIST", function(req,res){
  const listName = req.body.newlist;
  res.redirect("/"+listName)
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/delete',async function (req,res) {
  const checkeditemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    let product = await Item.findByIdAndRemove(checkeditemId).then(()=>{
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull :{items:{_id:checkeditemId}}}).then((foundList)=>{
      foundList.save().then(()=>{
        res.redirect("/"+ listName);
      })
    })
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(process.env.PORT||3000, function(){
  console.log("Server started on port 3000.");
});
