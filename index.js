const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const { expressjwt: jwt } = require("express-jwt");
const User = require('./user')
const app = express()
const port = 4000

require('dotenv').config()
mongoose.connect(process.env.BASEDEDATOS)
app.use(express.json())

const validateJwt = jwt({ secret: process.env.STRINGSECRET, algorithms: ["HS256"] })
const signToken = _id => jsonwebtoken.sign({ _id }, process.env.STRINGSECRET)



app.post('/register', async (req , res) => {
    const { body }  = req
    try {
        const isUser = await User.findOne( {email: body.email})
        if(isUser){
            return res.status(403).send('Usuario ya existente')
        }
        const salt = await bcrypt.genSalt()
        const hashed = await bcrypt.hash(body.password, salt);
        const user = await User.create( { email: body.email, password: hashed, salt})
        const signed = signToken(user._id)
        res.status(201).send(signed)
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
})

app.post('/login', async (req , res) => {
    const { body } = req
    try { 
        const user = await User.findOne( { email: body.email})
        if(!user){
            res.status(403).send('usario y/o contraseña inválida')
        } else {
            const isMatch = await bcrypt.compare(body.password, user.password)
            if (isMatch){
                const signed = signToken(user._id) 
                res.status(200).send(signed)
            } else {
                res.status(403).send('usuario y/o contraseña inválida')
            }
        }
    } catch (err){
        res.status(500).send(err.message)
    }
})

const findAndAssignUser = async (req, res, next) => {
    try {
        const user = await User.findOne(req.user_id)
        if (!user){
            return res.status(401).end()
        }
        req.user = user
        next()
    } catch (e){
        next(e)
    }
}
const autentificacion = express.Router().use(validateJwt, findAndAssignUser)
app.get('/lele', autentificacion, async (req, res) => {
    res.send(req.user)
})

app.listen(port, () => {
    console.log('listening in port 4000')
})
