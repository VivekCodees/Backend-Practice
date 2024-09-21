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
 
// routes import
import userRouter from './routes/user.routes.js'


// routes declaration
// whenever we come to /users route then the handle shifts to userRouter function and it proceeds further, here we can say that '/api/v1/users' is a prefix route
app.use('/api/v1/users', userRouter)
/*Eg routes:
For Register Route
https://localhost:8000/api/v1/users/register
For Login Route
https://localhost:8000/api/v1//users/login
*/
export { app }