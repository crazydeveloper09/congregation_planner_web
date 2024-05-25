import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now()
    },
    takenDate: Date,
    passedBackDate: Date,
    record: Object,
    preacher:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    serviceYear: Number,
})

export default mongoose.model("Checkout", checkoutSchema)