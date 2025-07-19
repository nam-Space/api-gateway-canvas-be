require('dotenv').config()

const express = require('express')
const proxy = require('express-http-proxy')
const cors = require('cors')
const helmet = require('helmet')
const authMiddleware = require('./middleware/auth-middleware')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, '/api')
    },
    proxyErrorHandler: (err, res, next) => {
        return res.status(500).json({
            message: 'Internal server error!',
            error: err.message
        })
    }
}

app.use('/v1/designs', authMiddleware, proxy(process.env.DESIGN, {
    ...proxyOptions,
}))

app.use('/v1/media/upload', authMiddleware, proxy(process.env.UPLOAD, {
    ...proxyOptions,
    parseReqBody: false
}))

app.use('/v1/media', authMiddleware, proxy(process.env.UPLOAD, {
    ...proxyOptions,
    parseReqBody: true
}))

app.use('/v1/subscription', authMiddleware, proxy(process.env.SUBSCRIPTION, {
    ...proxyOptions,
}))

app.listen(PORT, () => {
    console.log(`API Gateway is running on port: ${PORT}`)
    console.log(`DESIGN service is running on port: ${process.env.DESIGN}`)
    console.log(`UPLOAD service is running on port: ${process.env.UPLOAD}`)
    console.log(`SUBSCRIPTION service is running on port: ${process.env.SUBSCRIPTION}`)
})