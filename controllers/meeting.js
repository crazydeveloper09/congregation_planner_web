import express from "express";
import Meeting from "../models/meeting.js";
import Preacher from "../models/preacher.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import mongoose from "mongoose";
import ejs from 'ejs';
import pdf from 'html-pdf';
import path from 'path';
import { __dirname } from "../app.js";
import { chooseMeetingTypeColorAndIcon, groupBy, months } from "../helpers.js";
import MeetingAssignment from "../models/meetingAssignment.js";
import i18n from "i18n";
const app = express();

app.use(flash());
app.use(methodOverride("_method"))

export const meetingPopulate = [
    "lead", 
    "beginPrayer",
    "cleaningGroup", 
    "endPrayer", 
    "assignments",
    { 
        path: 'assignments',
        populate: {
            path: 'participant',
            model: 'Preacher'
        } 
    }, 
    { 
        path: 'assignments',
        populate: {
            path: 'reader',
            model: 'Preacher'
        } 
    }, 
    "audioVideo",
    { 
        path: 'audioVideo',
        populate: {
            path: 'microphone1Operator',
            model: 'Preacher'
        } 
    }, 
    { 
        path: 'audioVideo',
        populate: {
            path: 'microphone2Operator',
            model: 'Preacher'
        } 
    }, 
    { 
        path: 'audioVideo',
        populate: {
            path: 'videoOperator',
            model: 'Preacher'
        } 
    }, 
    { 
        path: 'audioVideo',
        populate: {
            path: 'audioOperator',
            model: 'Preacher'
        } 
    },
    "ordinal",
    { 
        path: 'ordinal',
        populate: {
            path: 'hallway1',
            model: 'Preacher'
        } 
    }, 
    { 
        path: 'ordinal',
        populate: {
            path: 'hallway2',
            model: 'Preacher'
        } 
    }, 
    { 
        path: 'ordinal',
        populate: {
            path: 'auditorium',
            model: 'Preacher'
        } 
    }, 
    { 
        path: 'ordinal',
        populate: {
            path: 'parking',
            model: 'Preacher'
        } 
    },
]

export const generateListOfMeetings = (req, res, next) => {
    i18n.setLocale(req.language);
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    Meeting
        .find({congregation: congregationID})
        .populate(meetingPopulate)
        .sort({date: 1})
        .exec()
        .then((meetings) => {
            let data = {
                meetings,
                month: req.query.month,
                type: req.query.type,
                groupBy,
                chooseMeetingTypeColorAndIcon,
                language: i18n
            };
           
            ejs.renderFile(path.join(__dirname, './views/meetings/generate-pdf.ejs'), data, {}, function(err, str) {
                if (err) return res.send({...err, line: 28});

                const title = `${req.query.type} - ${req.query.month}`;
                const DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'downloads/')

                var options = { format: 'A4', orientation: 'portrait', timeout: 540000, border: "10px" };

                pdf.create(str, options).toFile(`${DOWNLOAD_DIR}${title}.pdf`, function(err, data) {
                    if (err) return console.log(err);
                  
                    
                
                   res.download(data.filename, `${title}.pdf`, (err) => {
                        
                    })
                });
            
            });
            
        })
        .catch((err) => console.log(err))
}

export const getListOfMeetings = (req, res, next) => {
    
    i18n.setLocale(req.language);
    const congregationID = req.user.username ? req.user._id : req.user.congregation;
    Meeting
        .find({congregation: congregationID})
        .populate(meetingPopulate)
        .sort({date: 1})
        .exec()
        .then((meetings) => {
            res.render("./meetings/index", {
                meetings,
                month: req.query.month,
                type: req.query.type,
                groupBy,
                months,
                header: `${i18n.__("meetingSectionText")} | Congregation Planner`,
                chooseMeetingTypeColorAndIcon
            })
        })
        .catch((err) => console.log(err))
}

export const createMeeting = (req, res, next) => {
    let month = `${months[new Date(req.body.date).getMonth()]} ${new Date(req.body.date).getFullYear()}`;
    let newMeeting = {
        date: req.body.date,
        month,
        type: req.body.type,
        midSong: +req.body.midSong,
        endSong: +req.body.endSong
    }

    Meeting
        .create(newMeeting)
        .then((createdMeeting) => {
            const congregationID = req.user.username ? req.user._id : req.user.congregation;
            createdMeeting.congregation = congregationID;
            if(req.body.otherEndPrayer){
                createdMeeting.otherEndPrayer = req.body.otherEndPrayer;
            }
            if(req.body.cleaningGroup){
                createdMeeting.cleaningGroup = req.body.cleaningGroup;
            }
            if(req.body.lead){
                createdMeeting.lead = req.body.lead;
            }
            if(req.body.beginSong){
                createdMeeting.beginSong = +req.body.beginSong;
            }
            if(req.body.beginPrayer){
                createdMeeting.beginPrayer = req.body.beginPrayer;
            }
            if(req.body.endPrayer){
                createdMeeting.endPrayer = req.body.endPrayer;
            }
            createdMeeting.save();
            res.json(createdMeeting);
        })
        .catch((err) => console.log(err))
}



export const editMeeting = (req, res, next) => {
    Meeting
        .findByIdAndUpdate(req.params.meeting_id, req.body.meeting)
        .exec()
        .then((meeting) => {
            if(req.body.meeting.otherEndPrayer){
                meeting.otherEndPrayer = req.body.meeting.otherEndPrayer;
            }
            if(req.body.meeting.lead){
                meeting.lead = req.body.meeting.lead;
            }
            if(req.body.meeting.cleaningGroup){
                meeting.cleaningGroup = req.body.meeting.cleaningGroup;
            }
            if(req.body.meeting.beginSong){
                meeting.beginSong = req.body.meeting.beginSong;
            }
            if(req.body.meeting.beginPrayer){
                meeting.beginPrayer = req.body.meeting.beginPrayer;
            }
            meeting.save();
            
            res.json(meeting);
        })
        .catch((err) => console.log(err))
}

export const deleteMeeting = (req, res, next) => {
    Meeting
        .findByIdAndDelete(req.params.meeting_id)
        .exec()
        .then((meeting) => {
            MeetingAssignment
                .deleteMany({ meeting: req.params.meeting_id })
                .then((deletedAssignments) => {
                    res.json(meeting)
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const getListOfMeetingAssignmentsOfPreacher = (req, res, next) => {
    
    Meeting
        .find({ $or: [
                {lead: req.user._id}, 
                {beginPrayer: req.user._id}, 
                {endPrayer: req.user._id}, 
            ] 
        })
        .populate(meetingPopulate)
        .exec()
        .then((meetings) => {
            MeetingAssignment
                .find({ $or: [{participant: req.user._id}, {reader: req.user._id}]})
                .populate(["meeting", "reader"])
                .exec()
                .then((assignments) => {
                    res.json({meetings, assignments})
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

