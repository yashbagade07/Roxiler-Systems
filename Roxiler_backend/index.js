let express=require("express")
let mongoose=require("mongoose")
const route=
let cors=require("cors")
app.use(express.json())
app.use(cors())

mongoose.connect("").then(()=>{
    console.log("DB Con Ok")
}).catch((err)=>{
    console.log(err)
})

app.use("/",route)
app.listen(5000)