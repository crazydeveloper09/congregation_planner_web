import mongoose from "mongoose";

const cartsHourSchema = new mongoose.Schema({
    timeDescription: String,
    preacher1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    preacher2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    otherPreacher1: String,
    otherPreacher2: String,
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Congreagtion"
    },
    cartDay: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartDay"
    }
})

export default mongoose.model("CartHour", cartsHourSchema)