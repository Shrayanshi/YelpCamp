const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground'); //importing campground.js

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
});

//to produce random places and descriptors from the array
const sample = array => array[Math.floor(Math.random()*array.length)]
const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<50; i++){
        const rand = Math.floor(Math.random()*63);
        const price = Math.floor(Math.random() * 100);
        const camp = new Campground({
            location: `${cities[rand].city}, ${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/1376658",
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatem, quod accusantium amet modi, cum at ea quia repellendus quibusdam itaque nihil repellat ad recusandae velit inventore ducimus pariatur facilis minus.",
            price
        })
        await camp.save();
    }
}

//Will desiconnect node automatically
seedDB().then(() => {
    mongoose.connection.close();
});