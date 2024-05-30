import mongoose from "mongoose";

const cartsDaySchema = new mongoose.Schema({
    date: String,
    place: String,
    hours: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CartHour"
        }
    ],
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Congreagtion"
    }
})

export default mongoose.model("CartDay", cartsDaySchema)