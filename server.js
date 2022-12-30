require("dotenv").config()
const express = require('express')
const app = express()
const ejs = require("ejs")
const path = require("path")
const expressLayout = require("express-ejs-layouts")
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')


// database connection
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost/pizza", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
// .then(() => console.log("Database connected..."))
// .catch((err) => {
//     console.log('connection is failed due to: ', err);
// })

const connection = mongoose.connection
connection.once('open', () => {
    console.log('Database connected');
}).on("error", (err) => {
    console.log('Connection failed due to:', err)
})



// session store

// let mongoStore = new MongoDbStore({
//     mongooseConnection: connection,
//     collection: 'sessions'
// })


// session cofig
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({
        client:connection.getClient()
        // mongoUrl:'mongodb://localhost/pizza'
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } /* 24 hours */
}))

app.use(flash())
app.use(express.json()) 

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    next()
})

// set template engine
app.use(expressLayout)
app.set("views", path.join(__dirname, "/resources/views"))
app.set("view engine", "ejs")



require('./routes/web')(app)




// assets

app.use(express.static('public'))

app.listen(PORT, () => {
    console.log(`Listening on port at ${PORT}`);
})

