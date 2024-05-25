import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const preacherSchema = new mongoose.Schema({
    name: String,
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Congregation"
    }
});

preacherSchema.plugin(mongoosePaginate)

export default mongoose.model("Preacher", preacherSchema);