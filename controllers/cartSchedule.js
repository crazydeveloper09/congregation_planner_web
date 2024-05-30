import express from "express";
import CartDay from "../models/cartsDay.js";
import Preacher from "../models/preacher.js";
import CartHour from "../models/cartsHour.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import { __dirname } from "../app.js";
const app = express();

app.use(flash());
app.use(methodOverride("_method"))

export const getCurrentCartDay = (req, res, next) => {
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    CartDay
        .findOne({ $and: [{date: req.query.date}, {congregation: congregationID}] })
        .populate(["hours", { 
            path: 'hours',
            populate: {
              path: 'preacher1',
              model: 'Preacher'
            } 
         }, { 
            path: 'hours',
            populate: {
              path: 'preacher2',
              model: 'Preacher'
            } 
         }])
        .exec()
        .then((cartDay) => {
            res.json(cartDay)
        })
        .catch((err) => console.log(err))
}

export const createCartDay = (req, res, next) => {
    let date = new Date(req.body.date).toLocaleDateString('pl-Pl')
    let newCartDay = {
        place: req.body.place,

        date
    }

    CartDay
        .create(newCartDay)
        .then(async (createdCartDay) => {
            const congregationID = req.user.username ? req.user._id : req.user.congregation;
            createdCartDay.congregation = congregationID;
            const hours = []
            for(let i = req.body.startHour; i <= req.body.finalHour; i++){
                const hourDescription = `${i}:00 - ${i + 1}:00`;
                const createdCartHour = await CartHour.create({ timeDescription: hourDescription, preacher1: undefined, preacher2: undefined, congregation: req.user._id, cartDay: createdCartDay._id })
                hours.push(createdCartHour);
            }
            createdCartDay.hours.push(...hours);
            createdCartDay.save();
            res.json(createdCartDay);
        })
        .catch((err) => console.log(err))
}



export const editCartDay = (req, res, next) => {
    CartDay
        .findByIdAndUpdate(req.params.cartDay_id, req.body.cartDay)
        .exec()
        .then((cartDay) => {
            if(req.body.cartDay.topic){
                cartDay.topic = req.body.cartDay.topic;
                cartDay.save();
            }
            
            res.json(cartDay);
        })
        .catch((err) => console.log(err))
}

export const deleteCartDay = (req, res, next) => {
    CartDay
        .findByIdAndDelete(req.params.cartDay_id)
        .exec()
        .then((cartDay) => {
            CartHour
                .deleteMany({ cartDay: cartDay._id })
                .then((cartHours) => res.json(cartDay))
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const assignPreachersToHour = (req, res, next) => {
    CartHour
        .findById(req.params.cartHour_id)
        .exec()
        .then((cartHour) => {
    
            cartHour.preacher1 = req.body.preacher1 === "" ? undefined : req.body.preacher1;
            cartHour.preacher2 = req.body.preacher2 === "" ? undefined : req.body.preacher2;
            cartHour.otherPreacher1 = req.body.otherPreacher1 === "" ? undefined : req.body.otherPreacher1;
            cartHour.otherPreacher2 = req.body.otherPreacher2 === "" ? undefined : req.body.otherPreacher2;
            cartHour.save();
            res.json(cartHour)
        })
        .catch((err) => console.log(err))
}

export const getListOfCartHoursOfPreacher = (req, res, next) => {
    
    CartHour
        .find({ $or: [{ preacher1: req.user._id }, {preacher2: req.user._id}] })
        .populate("cartDay")
        .exec()
        .then((cartHours) => {
            res.json(cartHours)
        })
        .catch((err) => console.log(err))
}