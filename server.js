const  express = require('express')

const app = express()

const PORT = process.env.PORT || 3002;
//web server
app.use(express.static(__dirname ))
app.listen(PORT,()=>{
    console.log("sucessfully running at http://localhost:"+PORT)
})
// run with node server.js before run instal npm instal express