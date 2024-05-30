import mongoose from "mongoose";

const ministryMeetingSchema = new mongoose.Schema({
    hour: String,
    date: Date,
    month: String,
    place: String,
    defaultPlace: String,
    topic: String,
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Congregation"
    }
})

export default mongoose.model("MinistryMeeting", ministryMeetingSchema)