import express from "express";
import Preacher from "../models/preacher.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import { escapeRegex } from "../helpers.js";
import Territory from "../models/territory.js";
import Checkout from "../models/checkout.js";

const app = express();

app.use(flash());
app.use(methodOverride("_method"))

export const renderListOfPreachers = (req, res, next) => {
    const paginationOptions = {
        limit: req.query.limit || 10,
        page: req.query.page || 1,
        sort: {name: 1}
    }
    Preacher
        .paginate({congregation: req.user._id}, paginationOptions)
        .then((result) => {
            res.render("./preachers/index", { 
                currentUser: req.user, 
                result, 
                header: `Głosiciele zboru ${req.user.username} | Congregation Planner`, 
                pre: ""  
            });
        })
        .catch((err) => console.log(err))
}

export const getPreacherInfo = (req, res, next) => {
    const preacherID = req.user.congregation ? String(req.user._id) : String(req.params.preacher_id)
    Preacher
        .findById(preacherID)
        .exec()
        .then((preacher) => res.json(preacher))
        .catch((err) => res.json(err))
}

export const getInfoAboutPreacher = (req, res, next) => {
    Preacher
        .findById(req.params.preacher_id)
        .exec()
        .then((preacher) => {
            Territory
                .find({
                    $and: [
                        {preacher: preacher._id}, 
                        {congregation: req.user._id}
                    ]
                })
                .populate("preacher")
                .exec()
                .then((preacherTerritories) => {
                    Territory
                        .find({ $and: [{congregation: req.user._id}, {type: 'free'}]})
                        .populate(["preacher", "history", {
                            path: "history",
                            populate: {
                                path: "preacher",
                                model: "Preacher"
                            }
                        }])
                        .sort({lastWorked: 1})
                        .exec()
                        .then((availableTerritories) => {
                            res.render("./preachers/show", {
                                preacher,
                                preacherTerritories,
                                availableTerritories,
                                currentUser: req.user,
                                header: `${preacher.name} | ${req.user.username} | Territory Manager`
                            })
                        })
                        .catch((err) => console.log(err))
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const getAllPreachers = (req, res, next) => {
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    Preacher
    .find({congregation: congregationID})
    .sort({name: 1})
    .exec()
    .then((preachers) => {
        res.json(preachers)
    })
    .catch((err) => console.log(err))
}

export const renderNewPreacherForm = (req, res, next) => {
    res.render("./preachers/new", { 
        currentUser: req.user, 
        header: "Dodaj głosiciela | Territory Manager", 
        newP: "" 
    });
}

export const createPreacher = (req, res, next) => {
    Preacher
        .create({name: req.body.name})
        .then((createdPreacher) => {
            createdPreacher.congregation = req.user._id;
            createdPreacher.link = `https://cong.plan.pl/preacher/${createdPreacher._id}`;
            if(req.body.roles){
                createdPreacher.roles = typeof req.body.roles === 'string' ? [req.body.roles] : [...req.body.roles]
            }
            createdPreacher.save();
            res.json(createdPreacher);
        })
        .catch((err) => console.log(err))
}

export const renderPreacherEditForm = (req, res, next) => {
    Preacher
        .findById(req.params.preacher_id)
        .exec()
        .then((preacher) => {
            res.render("./preachers/edit", { 
                currentUser: req.user, 
                preacher: preacher, 
                header: `Edytuj głosiciela w zborze ${req.user.username} | Territory Manager`
            });
        })
        .catch((err) => console.log(err))
}

export const editPreacher = (req, res, next) => {
    Preacher
        .findByIdAndUpdate(req.params.preacher_id, req.body.preacher)
        .exec()
        .then((preacher) => {
            preacher.name = req.body.preacher.name;
            if(req.body.preacher.roles){
                preacher.roles = typeof req.body.preacher.roles === 'string' ? [req.body.preacher.roles] : [...req.body.preacher.roles]
            }
            
            preacher.save();
            res.json(preacher);
        })
        .catch((err) => console.log(err))
}

export const generateLinkForPreacher = (req, res, next) => {
    Preacher
        .findById(req.params.preacher_id)
        .exec()
        .then((preacher) => {
            preacher.link = `https://cong.plan.pl/preacher/${preacher._id}`;
            preacher.save()
            res.json(preacher)
        })
        .catch((err) => console.log(err))
}

// export const preacherLogIn = (req, res, next) => {
//     Preacher
//         .findOne({ link: req.body.link })
//         .exec()
//         .then((preacher) => {
//             if(!preacher){
//                 return res.json("Nie znaleziono takiego użytkownika")
//             }
//             const token = jwt.sign({ preacher: preacher._id }, process.env.JWT_SECRET);
//             res.json({ token, preacher })
//         })
//         .catch((err) => console.log(err))
// }

export const deletePreacher = (req, res, next) => {
    Preacher
        .findByIdAndDelete(req.params.preacher_id)
        .exec()
        .then((preacher) => {
            Territory
                .find({ preacher: preacher._id })
                .exec()
                .then((territories) => {
                    territories.forEach((territory) => {
                        territory.preacher = undefined;
                        territory.type = 'free';
                        territory.save()
                    })
                    Checkout
                        .find({ preacher: preacher._id })
                        .exec()
                        .then(async (checkouts) => {
                        
                                if(checkouts.length === 0){
                                    res.json(preacher)
                                } else {    
                                    const oldPreacher = await Preacher.findOne({ name: 'Były głosiciel' }).exec();
                                    if(oldPreacher){
                                        checkouts.forEach((checkout) => {
                                            checkout.preacher = oldPreacher;
                                            checkout.save();
                                            
                                        })
                                        res.json(preacher)
                                    } else {
                                        const newPreacher = await Preacher.create({ name: 'Były głosiciel', congregation: req.user._id});
                                        checkouts.forEach((checkout) => {
                                            checkout.preacher = newPreacher;
                                            checkout.save();
                                        })
                                        res.json(preacher)
                                    }
                                }
                            
                        })
                        .catch((err) => console.log(err))
                })
        })
        .catch((err) => console.log(err))
}

export const confirmDeletingPreacher = (req, res, next) => {
    Preacher
        .findById(req.params.preacher_id)
        .exec()
        .then((preacher) => {
            res.render("./preachers/deleteConfirm", {
                preacher: preacher,
                currentUser: req.user,
                header: `Potwierdzenie usunięcie głosiciela | Congregation Planner`
            });
        })
        .catch((err) => console.log(err))
}

export const searchPreachers = (req, res, next) => {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Preacher
        .find({
            $and: [
                {name: regex}, 
                {congregation: req.user._id}
            ]
        })
        .sort({name: 1})
        .exec()
        .then((preachers) => {
            res.json(preachers)
        })
        .catch((err) => console.log(err))
}