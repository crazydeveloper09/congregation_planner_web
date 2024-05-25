import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import expressSession from 'express-session';
import indexRoutes from "./routes/index.js";
import preachersRoutes from "./routes/preacher.js";
import territoriesRoutes from "./routes/territory.js";
import congregationsRoutes from "./routes/congregation.js";
import ministryGroupsRoutes from "./routes/ministryGroup.js";
import Congregation from "./models/congregation.js";
import LocalStrategy from "passport-local";
import flash from "connect-flash";
import dotenv from "dotenv";
import methodOverride from "method-override";
import path from 'path';
import helmet from "helmet";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("trust proxy", true)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(helmet({
    contentSecurityPolicy: false
}))
dotenv.config();

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})


app.use(expressSession({
    secret: "heheszki",
    resave: true,
    saveUninitialized: true
}));
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Congregation.authenticate()));
passport.serializeUser(Congregation.serializeUser());
passport.deserializeUser(Congregation.deserializeUser());

app.use("/preachers", preachersRoutes);
app.use("/territories", territoriesRoutes);
app.use("/congregations", congregationsRoutes)
app.use("/congregations/:congregation_id/ministryGroups", ministryGroupsRoutes)
app.use(indexRoutes);

app.listen(process.env.PORT);