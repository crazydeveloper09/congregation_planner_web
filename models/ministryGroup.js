import mongoose from "mongoose";

const ministryGroupSchema = new mongoose.Schema({
    name: String,
    preachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Preacher'
        }
    ],
    overseer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Preacher'
    },
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Congregation'
    }
})

export default mongoose.model('MinistryGroup', ministryGroupSchema)