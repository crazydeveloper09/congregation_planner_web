import express from "express";
import Ordinal from "../models/ordinal.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import ejs from 'ejs';
import pdf from 'html-pdf';
import path from 'path';
import { __dirname } from "../app.js";
import Meeting from "../models/meeting.js";
import { meetingPopulate } from "./meeting.js";
import { groupBy, months } from "../helpers.js";
import i18n from "i18n";
const app = express();

app.use(flash());
app.use(methodOverride("_method"))

export const generateListOfOrdinals = (req, res, next) => {
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    i18n.setLocale(req.language);
    Meeting
        .find({ $and: [
            {congregation: congregationID},
            {month: req.query.month},
        ]})
        .populate(meetingPopulate)
        .sort({date: 1})
        .exec()
        .then((meetings) => {
            let data = {
                month: req.query.month,
                meetings,
                language: i18n
            };
    
            ejs.renderFile(path.join(__dirname, './views/ordinals/generate-pdf.ejs'), data, {}, function(err, str) {
                if (err) return res.send({...err, line: 28});

                const title = `${i18n.__("sectionText")} - ${req.query.month}`;
                const DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'downloads/')


                var options = { format: 'A4', orientation: 'portrait', timeout: 540000 };

                pdf.create(str, options).toFile(`${DOWNLOAD_DIR}${title}.pdf`, function(err, data) {
                    if (err) return console.log(err);
                  
                    
                
                   res.download(data.filename, `${title}.pdf`, (err) => {
                        
                    })
                });
            
            });
            
        })
        .catch((err) => console.log(err))
}

export const getListOfOrdinals = (req, res, next) => {
    
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    i18n.setLocale(req.language);
    Meeting
        .find({congregation: congregationID})
        .populate(meetingPopulate)
        .sort({date: 1})
        .exec()
        .then((meetings) => {
            res.render("./ordinals/index", {
                meetings,
                month: req.query.month,
                groupBy,
                months,
                header: `${i18n.__("sectionText")} | Congregation Planner`,
            })
        })
        .catch((err) => console.log(err))
}

export const createOrdinal = (req, res, next) => {
    let newOrdinal = {
        hallway1: req.body.hallway1,
        auditorium: req.body.auditorium,
        meeting: req.params.meeting_id
    }

    Ordinal
        .create(newOrdinal)
        .then((createdOrdinal) => {
            if(req.body.hallway2){
                createdOrdinal.hallway2 = req.body.hallway2;
            }
            if(req.body.parking){
                createdOrdinal.parking = req.body.parking;
            }
            
            createdOrdinal.save();
            Meeting
                .findById(req.params.meeting_id)
                .exec()
                .then((meeting) => {
                    meeting.ordinal = createdOrdinal;
                    meeting.save();
                    res.json(createdOrdinal);
                })
                .catch((err) => console.log(err))
            
        })
        .catch((err) => console.log(err))
}



export const editOrdinal = (req, res, next) => {
    Ordinal
        .findById(req.params.ordinal_id)
        .exec()
        .then((ordinal) => {
            ordinal.hallway2 = req.body.ordinal.hallway2 !== "" ? req.body.ordinal.hallway2 : undefined;
            ordinal.parking = req.body.ordinal.parking !== "" ? req.body.ordinal.parking : undefined;
            ordinal.hallway1 = req.body.ordinal.hallway1;
            ordinal.auditorium = req.body.ordinal.auditorium;
            
            ordinal.save();
            
            res.json(ordinal);
        })
        .catch((err) => console.log(err))
}

export const deleteOrdinal = (req, res, next) => {
    Ordinal
        .findByIdAndDelete(req.params.ordinal_id)
        .exec()
        .then((ordinal) => {
            res.json(ordinal)
        })
        .catch((err) => console.log(err))
}

