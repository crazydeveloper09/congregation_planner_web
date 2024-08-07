import express from "express";
import MinistryMeeting from "../models/ministryMeeting.js";
import Preacher from "../models/preacher.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import ejs from 'ejs';
import pdf from 'html-pdf';
import path from 'path';
import { __dirname } from "../app.js";
import { groupBy, months } from "../helpers.js";
import i18n from "i18n";
const app = express();

app.use(flash());
app.use(methodOverride("_method"))

export const generateListOfMinistryMeetings = (req, res, next) => {
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    i18n.setLocale(req.language);
    MinistryMeeting
        .find({ $and: [
            {month: req.query.month},
            {congregation: congregationID}
        ] })
        .populate("lead")
        .sort({date: 1})
        .exec()
        .then((ministryMeetings) => {
            let data = {
                month: req.query.month,
                ministryMeetings,
                language: i18n
            };
            ejs.renderFile(path.join(__dirname, './views/ministryMeetings/generate-pdf.ejs'), data, {}, function(err, str) {
                if (err) return res.send({...err, line: 28});

                const title = `${i18n.__("ministryMeetingSectionText")} - ${req.query.month}`;
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

export const getListOfMinistryMeetings = (req, res, next) => {
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    i18n.setLocale(req.language);
    MinistryMeeting
        .find({congregation: congregationID})
        .populate("lead")
        .exec()
        .then((ministryMeetings) => {
            res.render("./ministryMeetings/index", {
                header: `${i18n.__("ministryMeetingSectionText")} | Congregation Planner`,
                ministryMeetings,
                groupBy,
                month: req.query.month,
                months,
            })
        })
        .catch((err) => console.log(err))
}

export const getListOfMinistryMeetingsOfPreacher = (req, res, next) => {
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    MinistryMeeting
        .find({ $and: [{ congregation: congregationID }, {lead: req.user._id}] })
        .populate("lead")
        .exec()
        .then((ministryMeetings) => {
            res.json(ministryMeetings)
        })
        .catch((err) => console.log(err))
}

export const createMinistryMeeting = (req, res, next) => {
    let month = `${months[new Date(req.body.date).getMonth()]} ${new Date(req.body.date).getFullYear()}`;
    let newMinistryMeeting = {
        place: req.body.place,
        defaultPlace: req.body.defaultPlace,
        hour: req.body.hour,
        date: req.body.date,
        month,
        lead: req.body.lead
    }

    MinistryMeeting
        .create(newMinistryMeeting)
        .then((createdMinistryMeeting) => {
            const congregationID = req.user.username ? req.user._id : req.user.congregation;
            createdMinistryMeeting.congregation = congregationID;
            if(req.body.topic){
                createdMinistryMeeting.topic = req.body.topic;
            }
            createdMinistryMeeting.save();
            res.json(createdMinistryMeeting);
        })
        .catch((err) => console.log(err))
}



export const editMinistryMeeting = (req, res, next) => {
    MinistryMeeting
        .findByIdAndUpdate(req.params.ministryMeeting_id, req.body.ministryMeeting)
        .exec()
        .then((ministryMeeting) => {
            if(req.body.ministryMeeting.topic){
                ministryMeeting.topic = req.body.ministryMeeting.topic;
                ministryMeeting.save();
            }
            
            res.json(ministryMeeting);
        })
        .catch((err) => console.log(err))
}

export const deleteMinistryMeeting = (req, res, next) => {
    MinistryMeeting
        .findByIdAndDelete(req.params.ministryMeeting_id)
        .exec()
        .then((ministryMeeting) => {
            res.json(ministryMeeting)
        })
        .catch((err) => console.log(err))
}

