import mongoose from "mongoose";

const audioVideoSchema = new mongoose.Schema({
    videoOperator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    audioOperator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    microphone1Operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    microphone2Operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting"
    }
})

export default mongoose.model("AudioVideo", audioVideoSchema)