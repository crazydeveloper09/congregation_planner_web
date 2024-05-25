import mongoose from"mongoose";
import passportLocalMongoose from"passport-local-mongoose";

const congregationSchema = new mongoose.Schema({
    username: String,
    password: String,
    territoryServantEmail: String,
    ministryOverseerEmail: String,
    verificationNumber: Number,
    verificationExpires: Date,
    verificated: {
        type: Boolean,
        default: false
    },
    territories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Territory"
        }
    ],
    preachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Preacher"
        }
    ],
    mainCity: String,
    mainCityLatitude: Number,
    mainCityLongitude: Number,
})
congregationSchema.plugin(passportLocalMongoose);
export default mongoose.model("Congregation", congregationSchema);