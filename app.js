const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/expressError');
const methodOverride = require('method-override')
const Campground = require('./models/campground'); //importing campground.js

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

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true})); //Parsing the req.body
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds',catchAsync( async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

//Order matters
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', catchAsync(async (req, res, next) => {
    if(!req.body.Campground) throw new expressError('Invalid Campground Data', 400)
    const campgrounds = new Campground(req.body.campgrounds); //It will be empty until we parse the body
    await campgrounds.save();
    res.redirect(`/campgrounds/${campgrounds._id}`)
}))

app.get('/campgrounds/:id', catchAsync( async (req, res, next) => {
    const campgrounds = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campgrounds})
}))

app.get('/campgrounds/:id/edit', catchAsync( async (req,res) => {
    const campgrounds = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campgrounds})
}))

app.put('/campgrounds/:id', catchAsync( async (req, res, next) => {
    const {id} = req.params;
    const campgrounds = await Campground.findByIdAndUpdate(id, {...req.body.campgrounds}); //We used 'req.body.campground' at first and not campgrounds above and both of them worked
    res.redirect(`/campgrounds/${campgrounds._id}`);
}))

app.delete('/campgrounds/:id',catchAsync( async (req, res) => {
    const {id} = req.params;
    const campgrounds = await Campground.findByIdAndDelete(id)
    res.render('campgrounds/show')
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oh No, Something Went Wrong"
    res.status(statusCode).render('error', {err})
})

app.listen(3000, ()=> {
    console.log('Serving on Port 3000')
})