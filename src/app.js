import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Three main configurations
app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'})) 
// static is used to store files and folders in public folder
app.use(express.static("public"))
app.use(cookieParser())
 
export { app }