// this code is inconsistent so we use another method to resolve this inconsistency
// require('dotenv').config({path: './env'}) 

import dotenv from 'dotenv'
import connectDB from "./db/index.js";
// import { app } from './app.js';


import express from 'express'
const app = express()


dotenv.config({
    path: './env'
})

// 2nd approach: we'll write the code in DB folder and bring it here.
connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port: ${process.env.PORT}`);
        
    })
} )
.catch((err) => {
    console.log('MONGO DB CONNECTION FAILED!!',err);
})

/*
// 1st approach
;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error', (error) => {
            console.log('Error occurred');
            throw error
        })

        app.listen(process.env.PORT , () => {
            console.log(`App is listening on Port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("Error:",error)
        throw error
    }
})()
connectDB()
*/