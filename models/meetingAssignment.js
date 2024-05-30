import mongoose from "mongoose";

const meetingAssignmentSchema = new mongoose.Schema({
    topic: String,
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    otherParticipant: String,
    reader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    type: String,
    defaultTopic: String,
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting"
    }
})

export default mongoose.model("MeetingAssignment", meetingAssignmentSchema)