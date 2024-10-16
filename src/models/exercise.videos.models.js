import mongoose, { Mongoose } from "mongoose";

const exerciseVideoSchema = mongoose.Schema({
    muscileGroup:{
        type:String
    },
    exerciseName:{
        type:String
    },
    videoURL:{
        type:String
    },
    fileName:{
        type:String
    }
},{
    timestamp:true
})

export const ExerciseVideo  = mongoose.model("ExerciseVideo",exerciseVideoSchema)