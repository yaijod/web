let express = require('express')

let bodyParser = require('body-parser')

let router = require('./router.js')
let path = require('path')
let app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/node_modules', express.static(path.join(__dirname, "/node_modules")))

app.use(router)

app.listen(3000, () => console.log('服务已启动'))