import express from "express";
import MeetingAssignment from "../models/meetingAssignment.js";
import Preacher from "../models/preacher.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import ejs from 'ejs';
import pdf from 'html-pdf';
import path from 'path';
import { __dirname } from "../app.js";
import { months } from "../helpers.js";
import Meeting from "../models/meeting.js";
const app = express();

app.use(flash());
app.use(methodOverride("_method"))

export const getListOfMeetingAssignments = (req, res, next) => {
    MeetingAssignment
        .find({ congregation: req.user._id })
        .populate("participant")
        .exec()
        .then((meetingAssignments) => {
            res.json(meetingAssignments)
        })
        .catch((err) => console.log(err))
}

export const createMeetingAssignment = (req, res, next) => {
    let newMeetingAssignment = {
        topic: req.body.topic,
        defaultTopic: req.body.defaultTopic,
        type: req.body.type,
        meeting: req.params.meeting_id
    }

    MeetingAssignment
        .create(newMeetingAssignment)
        .then((createdMeetingAssignment) => {
            if(req.body.otherParticipant){
                createdMeetingAssignment.otherParticipant = req.body.otherParticipant;
            }
            if(req.body.participant){
                createdMeetingAssignment.participant = req.body.participant;
            }
            if(req.body.reader){
                createdMeetingAssignment.reader = req.body.reader;
            }
            createdMeetingAssignment.save();
            Meeting
                .findById(req.params.meeting_id)
                .exec()
                .then((meeting) => {
                    meeting.assignments.push(createdMeetingAssignment);
                    meeting.save();
                    res.json(createdMeetingAssignment);
                })
                .catch((err) => console.log(err))
            
        })
        .catch((err) => console.log(err))
}



export const editMeetingAssignment = (req, res, next) => {
    MeetingAssignment
        .findById(req.params.meetingAssignment_id)
        .exec()
        .then((meetingAssignment) => {
            meetingAssignment.topic = req.body.assignment.topic;
            meetingAssignment.defaultTopic = req.body.assignment.defaultTopic;
            meetingAssignment.type = req.body.assignment.type;
            meetingAssignment.otherParticipant = req.body.assignment.otherParticipant !== "" ? req.body.assignment.otherParticipant : undefined;
            meetingAssignment.participant = req.body.assignment.participant !== "" ? req.body.assignment.participant : undefined;
            meetingAssignment.reader = req.body.assignment.reader !== "" ? req.body.assignment.reader : undefined;
            
            meetingAssignment.save();
            
            res.json(meetingAssignment);
        })
        .catch((err) => console.log(err))
}

export const deleteMeetingAssignment = (req, res, next) => {
    MeetingAssignment
        .findByIdAndDelete(req.params.meetingAssignment_id)
        .exec()
        .then((meetingAssignment) => {
            res.json(meetingAssignment)
        })
        .catch((err) => console.log(err))
}

