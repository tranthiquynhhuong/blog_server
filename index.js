const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 5000;

mongoose.connect("mongodb+srv://BlogUser:bloguserpassword@cluster0.k5igt.mongodb.net/AppDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    userCreateIndex: true, 
    useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open",()=>{
    console.log("Mongodb connected by mongoose");
});

///middleware
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const userRoute = require("./routes/user");
app.use("/user", userRoute);
const profileRoute = require("./routes/profile");
app.use("/profile", profileRoute);
const blogRoute = require("./routes/blogpost");
app.use("/blogPost", blogRoute);

app.route("/").get((req,res) => res.json("Hello World! :3"));
app.listen(port, "0.0.0.0", () =>
  console.log(`welcome your listinnig at port ${port}`)
);
