import express from "express";
import flash from "connect-flash";
import passport from "passport";
import methodOverride from "method-override";
import { sendEmail } from "../helpers.js";
import Activity from "../models/activity.js";
import ipWare from 'ipware';
import i18n from "i18n";

const app = express();
const getIP = ipWare().get_ip;

app.use(flash());
app.use(methodOverride("_method"));

export const redirectToLogin = (req, res, next) => {
    res.redirect("/login");
}

export const renderLoginForm = (req, res, next) => {
    i18n.setLocale(req.language);
    let ipInfo = getIP(req);
    res.render("login", {
        header: `${i18n.__("loginHeader")} | Congregation Planner`,
        ipInfo
    });
}

export const renderPrivacyPolicy = (req, res, next) => {
    i18n.setLocale(req.language);
    res.render(`policy_${req.language === "pl" ? "pl": "en"}`, {
        header: `${i18n.__("policyLabel")} | Congregation Planner`
    });
}

export const authenticateCongregation = (req, res, next) => {
    i18n.setLocale(req.language);
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            req.flash("error", i18n.__("badLogIn"));
            return res.redirect(`/login`);
        }
        if(user.verificated){
            req.logIn(user, async function (err) {
                if (err) { return next(err); }
                let ipInfo = getIP(req);
                await Activity.create({ipAddress: ipInfo.clientIp, platform: req.header('sec-ch-ua-platform'), userAgent: req.header('user-agent'), applicationType: 'Aplikacja internetowa', congregation: user._id})
                let verificationCode = '';
                for (let i = 0; i <= 5; i++) {
                    let number = Math.floor(Math.random() * 10);
                    let numberString = number.toString();
                    verificationCode += numberString;
                }
                user.verificationNumber = verificationCode;
                user.verificationExpires = Date.now() + 360000;
                user.save()
                const subject = i18n.__("twoFactorTitle");
                const emailText = i18n.__("twoFactorMessage");
                sendEmail(subject, user.territoryServantEmail, emailText, user)
                sendEmail(subject, user.ministryOverseerEmail, emailText, user)
                return res.redirect(`/congregations/${user._id}/two-factor`);
            });
        } else {
            res.redirect(`/congregations/${user._id}/verification`)
        }
      
    })(req, res, next);
}

export const logOutCongregation = (req, res, next) => {
    req.logout();
    res.redirect("/login");
}
