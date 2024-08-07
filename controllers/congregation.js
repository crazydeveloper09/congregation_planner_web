import express from "express";
import Congregation from "../models/congregation.js";
import MinistryGroup from "../models/ministryGroup.js";
import flash from "connect-flash";
import passport from "passport";
import dotenv from 'dotenv';
import node_geocoder from "node-geocoder";
import methodOverride from "method-override";
import { months, sendEmail } from "../helpers.js";
import Activity from "../models/activity.js";
import Territory from "../models/territory.js";
import i18n from "i18n";

dotenv.config();

const app = express();
app.use(flash());
app.use(methodOverride("_method"));

let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  };
let geocoder = node_geocoder(options);

export const renderRegisterCongregationForm = (req, res, next) => {
    i18n.setLocale(req.language);
    if(req.query.code === process.env.REGISTER_CODE){
        res.render("./congregations/new", {
            header: `${i18n.__("registerHeading")} | Congregation Planner`,
            congregation: ''
        });
    } else {
      res.send(i18n.__("noAccess"))
    }
	
}

export const registerCongregation = (req, res, next) => {
    i18n.setLocale(req.language);
    if(req.body.password !== req.body.confirm){
        req.flash("error", i18n.__("passwordsNotTheSame"));
        res.render("./congregations/new", { error:  i18n.__("passwordsNotTheSame"), congregation: req.body, header: `${i18n.__("registerHeading")} | Congregation Planner`});
    } else {
        geocoder.geocode(req.body.mainCity, function (err, data) {
            if (err || !data.length) {
                req.flash('error', err.message);
                return res.redirect(`/congregations/new`);
            }

            let verificationCode = '';
            for (let i = 0; i <= 5; i++) {
                let number = Math.floor(Math.random() * 10);
                let numberString = number.toString();
                verificationCode += numberString;
            }
            let newUser = new Congregation({
                username: req.body.username,
                territoryServantEmail: req.body.territoryServantEmail,
                ministryOverseerEmail: req.body.ministryOverseerEmail,
                verificationNumber: verificationCode,
                mainCity: req.body.mainCity,
                mainCityLatitude: data[0].latitude,
                mainCityLongitude: data[0].longitude,
                verificationExpires: Date.now() + 360000
            });
            Congregation.register(newUser, req.body.password, function(err, congregation) {
                if(err) {
                    
                    return res.render("./congregations/new", { error: err.message});
                } 
                passport.authenticate("local")(req, res, function() {
                    const subject = i18n.__("emailVerificationTitle");
                    const emailText = i18n.__("emailVerificationMessage");
                    sendEmail(subject, congregation.territoryServantEmail, emailText, congregation)
                    sendEmail(subject, congregation.ministryOverseerEmail, emailText, congregation)
                    res.redirect(`/congregations/${congregation._id}/verification`);
                });
            });
        });
    }
}

export const renderCongregationInfo = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findById(req.params.congregation_id)
        .populate(["preacher", "territories"])
        .exec()
        .then((congregation) => {
            MinistryGroup
                .find({ congregation: congregation._id })
                .populate(["preachers", "overseer"])
                .exec()
                .then((ministryGroups) => {
                    Territory
                        .find({ congregation: congregation._id })
                        .populate("history")
                        .exec()
                        .then((territories) => {
                            res.render("./congregations/show", {
                                header: `Zbór ${congregation.username} | Congregation Planner`,
                                congregation,
                                currentUser: req.user,
                                ministryGroups,
                                territories
                            })
                        })
                        .catch((err) => console.log(err))
                    
                })
                .catch((err) => console.log(err))
        })
        .catch((err) =>  console.log(err))
}

export const renderEditCongregationForm = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findById(req.params.congregation_id)
        .exec()
        .then((congregation) => {
            res.render("./congregations/edit", { 
                currentUser: req.user, 
                congregation: congregation, 
                header: `Edytuj głosiciela w zborze ${req.user.username} | Congregation Planner`
            });
        })
        .catch((err) => console.log(err));
}

export const editCongregation = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findByIdAndUpdate(req.params.congregation_id, req.body.congregation)
        .exec()
        .then((congregation) => {
            geocoder.geocode(req.body.congregation.mainCity, function (err, data) {
                if (err || !data.length) {
                    req.flash('error', err.message);
                    return res.redirect(`/congregations/new`);
                }

                congregation.mainCity = req.body.congregation.mainCity;
                congregation.mainCityLatitude = data[0].latitude;
                congregation.mainCityLongitude = data[0].longitude;
                congregation.save();
                res.redirect(`/congregations/${congregation._id}`)
            });
        })
        .catch((err) => console.log(err))
}

export const renderVerificationForm = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findOne({
            $and: [
                {_id: req.params.congregation_id},
                {verificationExpires: { $gt: Date.now()}}
            ]
        })
        .exec()
        .then((congregation) => {
            if(congregation){
                let header = `${i18n.__("verificationHeading")} Congregation Planner`
                res.render("./congregations/verification", {
                    header: header,
                    congregation: congregation
                })
            } else {
                req.flash("error", i18n.__("expiredCode"));
                let header = `${i18n.__("verificationHeading")} Congregation Planner`
                res.render("./congregations/verification", {
                    header: header,
                    congregation_id: req.params.congregation_id
                })
            }
        })
        .catch((err) => console.log(err))
}

export const verifyCongregation = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findOne({
            $and: [
                {_id: req.params.congregation_id},
                {verificationExpires: { $gt: Date.now()}},
            ]
        })
        .exec()
        .then((congregation) => {
            if(congregation){
                if(congregation.verificationNumber === +req.body.code){
                    congregation.verificated = true;
                    congregation.save();
                    req.flash("success", `${i18n.__("welcome")} ${congregation.username}. ${i18n.__("niceToMeetYou")}`)
                    res.redirect("/login")
                } else {
                    req.flash("error", i18n.__("wrongCode"))
                    res.redirect(`back`)
                }
            } else {
                req.flash("error", i18n.__("expiredCode"));
                res.redirect("back")
            }
        })
        .catch((err) => console.log(err))
}

export const resendVerificationCode = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findById(req.params.congregation_id)
        .exec()
        .then((congregation) => {
            let verificationCode = '';
            for (let i = 0; i <= 5; i++) {
                let number = Math.floor(Math.random() * 10);
                let numberString = number.toString();
                verificationCode += numberString;
            }
            congregation.verificationNumber = verificationCode;
            congregation.verificationExpires = Date.now() + 360000;
            congregation.save()
            const subject = i18n.__("resendEmailVerificationTitle");
            const emailText = i18n.__("resendEmailVerificationMessage");
            sendEmail(subject, congregation.territoryServantEmail, emailText, congregation)
            sendEmail(subject, congregation.ministryOverseerEmail, emailText, congregation)
            res.redirect(`/congregations/${congregation._id}/verification`);
        })
        .catch((err) => console.log(err))
}

export const renderTwoFactorForm = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findOne({
            $and: [
                {_id: req.params.congregation_id},
                {verificationExpires: { $gt: Date.now()}}
            ]
        })
        .exec()
        .then((congregation) => {
            if(congregation){
                let header = `${i18n.__("twoFactorHeaderText")} | Congregation Planner`
                res.render("./congregations/two-factor", {
                    header: header,
                    congregation: congregation,
                    testUser: process.env.TEST_USER
                })
            } else {
                req.flash("error", i18n.__("expiredCode"));
                let header = `${i18n.__("twoFactorHeaderText")} | Congregation Planner`
                res.render("./congregations/two-factor", {
                    header: header,
                    congregation_id: req.params.congregation_id
                })
            }
        })
        .catch((err) => console.log(err))
}

export const verifyTwoFactor = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findOne({
            $and: [
                {_id: req.params.congregation_id},
                {verificationExpires: { $gt: Date.now()}},
                {verificationNumber: +req.body.code}
            ]
        })
        .exec()
        .then((congregation) => {
            if(congregation){
                req.flash("success", `Pomyślnie zalogowałeś się do Congregation Planner`)
                res.redirect(`/meetings?type=${new Date().getDay() === 0 || new Date().getDay() === 6 ? i18n.__("weekend") : i18n.__("midWeek")}&month=${i18n.__(months[new Date().getMonth()]) + " " + new Date().getFullYear()}`)
            } else {
                req.flash("error", i18n.__("expiredCode"));
                res.redirect("back")
            }
        })
        .catch((err) => console.log(err))
}

export const resendTwoFactorCode = (req, res, next) => {
    i18n.setLocale(req.language);
    Congregation
        .findById(req.params.congregation_id)
        .exec()
        .then((congregation) => {
            let verificationCode = '';
            for (let i = 0; i <= 5; i++) {
                let number = Math.floor(Math.random() * 10);
                let numberString = number.toString();
                verificationCode += numberString;
            }
            congregation.verificationNumber = verificationCode;
            congregation.verificationExpires = Date.now() + 360000;
            congregation.save()
            const subject = i18n.__("resendTwoFactorTitle");
            const emailText = i18n.__("resendTwoFactorMessage");
            
            sendEmail(subject, congregation.territoryServantEmail, emailText, congregation)
            sendEmail(subject, congregation.ministryOverseerEmail, emailText, congregation)
            res.redirect(`/congregations/${congregation._id}/two-factor`);
        })
        .catch((err) => console.log(err))
}

export const getAllCongregationActivities = (req, res, next) => {
    Activity
        .find({ congregation: req.params.congregation_id })
        .exec()
        .then((activities) => res.render('./congregations/activity', {
            activities,
            header: 'Aktywności logowania | Congregation Planner',
            currentUser: req.user
        }))
        .catch((err) => console.log(err))
}
    
