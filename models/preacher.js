import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';
import passportLocalMongoose from"passport-local-mongoose";

const preacherSchema = new mongoose.Schema({
    name: String,
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Congregation"
    },
    link: String,
    roles: Array
});
preacherSchema.plugin(passportLocalMongoose);
preacherSchema.plugin(mongoosePaginate)

export default mongoose.model("Preacher", preacherSchema);