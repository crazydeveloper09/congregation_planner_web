import mongoose from "mongoose";

const ordinalSchema = new mongoose.Schema({
    hallway1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    hallway2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    parking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    auditorium: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting"
    }
})

export default mongoose.model("Ordinal", ordinalSchema)