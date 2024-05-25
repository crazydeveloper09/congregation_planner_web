import express from "express";
import MinistryGroup from "../models/ministryGroup.js";
import Preacher from "../models/preacher.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import ejs from 'ejs';
import pdf from 'html-pdf';
import path from 'path';
import dotenv from 'dotenv';
import { __dirname } from "../app.js";
const app = express();

dotenv.config();

app.use(flash());
app.use(methodOverride("_method"))

export const generateListOfMinistryGroups = (req, res, next) => {
    MinistryGroup
        .find({congregation: req.user._id})
        .populate(["preachers", "overseer"])
        .sort({name: 1})
        .exec()
        .then((ministryGroups) => {
            let data = {
                currentUser: req.user.toJSON(), 
                ministryGroups
            };
            ejs.renderFile(path.join(__dirname, './views/ministryGroups/generate-pdf.ejs'), data, {}, function(err, str) {
                if (err) return res.send({...err, line: 28});

                const title = data.currentUser.username.split(" ").join("-");
                const DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'downloads/')

              
                var options = { 
                    format: 'A4', 
                    orientation: 'landscape', 
                    timeout: 540000,
                };

                pdf.create(str, options).toFile(`${DOWNLOAD_DIR}Grupy_sluzby_${title}.pdf`, function(err, data) {
                    if (err) return console.log(err);
                  
                    
                
                   res.download(data.filename, `Grupy_sluzby_${title}.pdf`, (err) => {
                        if (err) {
                            res.send({
                                error : err,
                                msg   : "Problem downloading the file"
                            })
                        } else {
                            req.flash("success", "Plik pomyślnie utworzony. Zobacz folder Pobrane")
                    
                        }
                    })
                });
            
            });
            
        })
        .catch((err) => console.log(err))
}

export const renderNewMinistryGroupForm = (req, res, next) => {
    Preacher
        .find({congregation: req.user._id})
        .sort({name: 1})
        .exec()
        .then((preachers) => {
            res.render("./ministryGroups/new", { 
                currentUser: req.user, 
                header: "Dodaj grupę służby | Territory Manager", 
                preachers 
            });
        })
        .catch((err) => console.log(err))
}

export const createMinistryGroup = (req, res, next) => {
    MinistryGroup
        .create({name: req.body.name})
        .then((createdMinistryGroup) => {
            createdMinistryGroup.congregation = req.user._id;
            createdMinistryGroup.preachers = typeof req.body.preachers === 'string' ? [req.body.preachers] : [...req.body.preachers];
            createdMinistryGroup.overseer = req.body.overseer;
            createdMinistryGroup.save();
            res.redirect(`/congregations/${req.user._id}`);
        })
        .catch((err) => console.log(err))
}

export const renderMinistryGroupEditForm = (req, res, next) => {
    MinistryGroup
        .findById(req.params.ministryGroup_id)
        .populate(["preachers", "overseer"])
        .exec()
        .then((ministryGroup) => {
            Preacher
                .find({congregation: req.user._id})
                .sort({name: 1})
                .exec()
                .then((preachers) => {
                    res.render("./ministryGroups/edit", { 
                        currentUser: req.user, 
                        ministryGroup: ministryGroup, 
                        preachers,
                        header: `Edytuj grupę służby w zborze ${req.user.username} | Territory Manager`
                    });
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const editMinistryGroup = (req, res, next) => {
    MinistryGroup
        .findByIdAndUpdate(req.params.ministryGroup_id, req.body.ministryGroup)
        .exec()
        .then((ministryGroup) => {
            ministryGroup.name = req.body.ministryGroup.name;
            ministryGroup.preachers = typeof req.body.preachers === 'string' ? [req.body.ministryGroup.preachers] : [...req.body.ministryGroup.preachers];
            ministryGroup.overseer = req.body.ministryGroup.overseer;
            ministryGroup.save();
            res.redirect(`/congregations/${req.user._id}`);
        })
        .catch((err) => console.log(err))
}

export const deleteMinistryGroup = (req, res, next) => {
    MinistryGroup
        .findByIdAndDelete(req.params.ministryGroup_id)
        .exec()
        .then((ministryGroup) => {
            res.redirect(`/congregations/${req.user._id}/`)
        })
        .catch((err) => console.log(err))
}

export const confirmDeletingMinistryGroup = (req, res, next) => {
    MinistryGroup
        .findById(req.params.ministryGroup_id)
        .exec()
        .then((ministryGroup) => {
            res.render("./ministryGroups/deleteConfirm", {
                ministryGroup: ministryGroup,
                currentUser: req.user,
                header: `Potwierdzenie usunięcia grupy służby | Territory Manager`
            });
        })
        .catch((err) => console.log(err))
}