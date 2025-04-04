const dotenv = require("dotenv"); // require package
dotenv.config(); // Loads the environment variables from .env file

// We begin by loading Express
const express = require("express");
const mongoose = require("mongoose"); // require package
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");

const app = express();
// connect to MongoDB/Mongoose
mongoose.connect(process.env.MONGODB_URI);
// log connection status to terminal on start
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Import the Fruit model
const Fruit = require("./models/fruit.js");
// Add middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
// GET /
app.get("/", async (req, res) => {
    res.render("index.ejs");
});
// GET /fruits/new
app.get("/fruits/new", (req, res) => {
    res.render("fruits/new.ejs");
});

app.get("/fruits/:fruitId", async (req, res) => {
    const foundFruit = await Fruit.findById(req.params.fruitId);
    console.log(foundFruit)
    res.render("fruits/show.ejs", { fruit: foundFruit })
});

app.get("/fruits/:fruitId/edit", async (req, res) => {
    const foundFruit = await Fruit.findById(req.params.fruitId);
    res.render("fruits/edit.ejs", {
        fruit: foundFruit,
    });
});



app.delete("/fruits/:fruitId", async (req, res) => {
    await Fruit.findByIdAndDelete(req.params.fruitId);
    res.redirect("/fruits");
});


app.post("/fruits", async (req, res) => {
    console.log("Before", req.body)
    if (req.body.isReadyToEat === "on") {
        req.body.isReadyToEat = true;
    } else {
        req.body.isReadyToEat = false;
    }

    console.log("After", req.body)

    await Fruit.create(req.body);
    res.redirect("/fruits");
});

app.get("/fruits", async (req, res) => {

    // get all the fruits from the database
    const allFruits = await Fruit.find();
    console.log(allFruits);
    // render the page that shows all the fruits
    res.render("fruits/index.ejs", { fruits: allFruits });
});



app.put("/fruits/:fruitId", async (req, res) => {
    // Handle the 'isReadyToEat' checkbox data
    if (req.body.isReadyToEat === "on") {
        req.body.isReadyToEat = true;
    } else {
        req.body.isReadyToEat = false;
    }

    // Update the fruit in the database
    await Fruit.findByIdAndUpdate(req.params.fruitId, req.body);

    // Redirect to the fruit's show page to see the updates
    res.redirect(`/fruits/${req.params.fruitId}`);
});




app.listen(3000, () => {
    console.log('Listening on port 3000');
});
