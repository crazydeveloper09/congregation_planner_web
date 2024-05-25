import express from "express";
import Preacher from "../models/preacher.js";
import Territory from "../models/territory.js";
import Checkout from "../models/checkout.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import dotenv from 'dotenv';
import node_geocoder from "node-geocoder";
// import mbxClient from '@mapbox/mapbox-sdk';
// import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';
import { countDaysFromNow, createCheckout, dateToISOString, escapeRegex, groupBy } from "../helpers.js";

dotenv.config();

const app = express();
// const mbxMainClient = mbxClient({ accessToken: process.env.MAPBOX_TOKEN });
// const geocoder = mbxGeocoding(mbxMainClient);

// console.log(mbxMainClient);
// console.log(geocoder.forwardGeocode())

let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  };
let geocoder = node_geocoder(options);


app.use(flash());
app.use(methodOverride("_method"));

export const renderListOfAllTerritories = (req, res, next) => {
    const paginationOptions = {
        limit: req.query.limit || 20,
        page: req.query.page || 1,
        populate: 'preacher',
        sort: {number: 1}
    }
    Territory
        .paginate({congregation: req.user._id}, paginationOptions)
        .then((result) => {
            Preacher
                .find({congregation: req.user._id})
                .sort({name: 1})
                .exec()
                .then((preachers) => {
                
                            res.render("./territories/index", {
                                currentUser: req.user, 
                                result, 
                                preachers: preachers,
                                countDaysFromNow: countDaysFromNow,
                                dateToISOString: dateToISOString, 
                                header: "Wszystkie tereny | Territory Manager", 
                                all: "" 
                            });
                
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const renderListOfAvailableTerritories = (req, res, next) => {
    const paginationOptions = {
        limit: req.query.limit || 15,
        page: req.query.page || 1,
        populate: 'preacher',
        sort: {lastWorked: 1}
    }
    Territory
        .find({ $and: [{congregation: req.user._id}, {type: 'free'}]})
        .exec()
        .then((territories) => {
            Territory
                .paginate({ $and: [{congregation: req.user._id}, {type: 'free'}]}, paginationOptions)
                .then(async (result) => {
                    const preachers = await Preacher.find({congregation: req.user._id}).exec();
                    res.render("index", {
                        currentUser: req.user, 
                        territories: territories,
                        result,
                        preachers,
                        countDaysFromNow: countDaysFromNow, 
                        header: "Home | Territory Manager", 
                        home: ""
                    });
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const assignTerritory = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .exec()
        .then((territory) => {
            const taken = new Date();
            territory.taken = taken;
            territory.preacher = req.body.preacher;
            territory.type = undefined;
            
            territory.save();
            res.redirect(`/territories/${territory._id}`)
        })
        .catch((err) => console.log(err))
}

export const makeTerritoryFreeAgain = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .exec()
        .then(async (territory) => {
            const lastWorked = new Date(req.body.lastWorked);
            let checkout = await createCheckout(territory, req.body);
        
            if(checkout){
                territory.history.push(checkout);
            }
            territory.lastWorked = lastWorked;
            territory.preacher = undefined;
            territory.type = "free";
            
            territory.save();
            res.redirect(`/territories/${territory._id}`)
        })
        .catch((err) => console.log(err))
}


export const renderNewTerritoryForm = (req, res, next) => {
    Preacher
        .find({congregation: req.user._id})
        .sort({name: 1})
        .exec()
        .then((preachers) => {
            res.render("./territories/new", { 
                currentUser: req.user, 
                preachers: preachers, 
                header: "Dodaj teren | Territory Manager", 
                newT: "" 
            });
        })
        .catch((err) => console.log(err))
}

export const searchAllTerritories = (req, res, next) => {
    const paginationOptions = {
        limit: req.query.limit || 20,
        page: req.query.page || 1,
        populate: 'preacher',
        sort: {number: 1}
    }
    if(typeof req.query.city !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.city), 'gi');
        Territory
            .paginate({
                $and: [
                    {city: regex}, 
                    {congregation: req.user._id}
                ]
            }, paginationOptions)
            .then((result) => {
                Preacher
                    .find({congregation: req.user._id})
                    .sort({name: 1})
                    .exec()
                    .then((preachers) => {
                        res.render("./territories/search", {
                            param: req.query.city, 
                            paramName: 'city', 
                            result, 
                            currentUser: req.user, 
                            preachers: preachers,
                            countDaysFromNow: countDaysFromNow,
                            dateToISOString: dateToISOString,
                            header: "Wyszukiwanie terenów po miejscowości | Territory Manager"
                        });
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.street !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.street), 'gi');
        Territory
            .paginate({
                $and: [
                    {street: regex}, 
                    {congregation: req.user._id}
                ]
            }, paginationOptions)
            .then((result) => {
                Preacher
                    .find({congregation: req.user._id})
                    .sort({name: 1})
                    .exec()
                    .then((preachers) => {
                        res.render("./territories/search", {
                            param: req.query.street, 
                            paramName: 'street', 
                            result,  
                            currentUser: req.user, 
                            preachers: preachers,
                            countDaysFromNow: countDaysFromNow,
                            dateToISOString: dateToISOString,
                            header: "Wyszukiwanie terenów po ulicy | Territory Manager"
                        });
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
            
    } else if(typeof req.query.number !== 'undefined'){
        
        Territory
            .paginate({
                $and: [
                    {number: req.query.number}, 
                    {congregation: req.user._id}
                ]
            }, paginationOptions)
            .then((result) => {
                Preacher
                    .find({congregation: req.user._id})
                    .sort({name: 1})
                    .exec()
                    .then((preachers) => {
                        res.render("./territories/search", {
                            param: req.query.number,
                            paramName: 'number',  
                            result,  
                            currentUser: req.user, 
                            preachers: preachers,
                            countDaysFromNow: countDaysFromNow,
                            dateToISOString: dateToISOString,
                            header: "Wyszukiwanie terenów po nr terenu | Territory Manager"
                        });
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.preacher !== 'undefined'){
        Preacher
            .findOne({ 
                $and: [
                    { congregation: req.user._id }, 
                    {_id: req.query.preacher}
                ] 
            })
            .exec()
            .then((preacher) => {
                Territory
                    .paginate({
                        $and: [
                            {preacher: preacher._id}, 
                            {congregation: req.user._id}
                        ]
                    }, paginationOptions)
                    .then((result) => {
                        Preacher
                            .find({congregation: req.user._id})
                            .sort({name: 1})
                            .exec()
                            .then((preachers) => {
                                res.render("./territories/search", {
                                    param: preacher.name, 
                                    paramName: 'preacher', 
                                    result,
     
                                    currentUser: req.user, 
                                    preachers: preachers,
                                    countDaysFromNow: countDaysFromNow,
                                    dateToISOString: dateToISOString,
                                    header: "Wyszukiwanie terenów po głosicielu | Territory Manager"
                                });
                            })
                            .catch((err) => console.log(err))
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log.err)
    } else if(typeof req.query.kind !== 'undefined'){
        
        Territory
            .paginate({
                $and: [
                    {kind: req.query.kind}, 
                    {congregation: req.user._id}
                ]
            }, paginationOptions)
            .then((result) => {
                Preacher
                    .find({congregation: req.user._id})
                    .sort({name: 1})
                    .exec()
                    .then((preachers) => {
                        res.render("./territories/search", {
                            param: req.query.kind,
                            paramName: 'kind',  
                            result, 
                            currentUser: req.user, 
                            preachers: preachers,
                            countDaysFromNow: countDaysFromNow,
                            dateToISOString: dateToISOString,
                            header: "Wyszukiwanie terenów po rodzaju terenu | Territory Manager"
                        })
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.taken !== 'undefined') {
        Territory
        .paginate({
            $and: [
                {type: { $not: /free/ }}, 
                {congregation: req.user._id}
            ]
        }, paginationOptions)
        .then((result) => {
            Preacher
                .find({congregation: req.user._id})
                .sort({name: 1})
                .exec()
                .then((preachers) => {
                    res.render("./territories/search", {
                        param: req.query.taken,
                        paramName: 'taken', 
                        result, 
                        currentUser: req.user, 
                        preachers: preachers,
                        countDaysFromNow: countDaysFromNow,
                        dateToISOString: dateToISOString,
                        header: "Wyszukiwanie terenów | Territory Manager"
                    });
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
    }
}

export const createTerritory = (req, res, next) => {
    let newTerritory = new Territory({
        city: req.body.city, 
        street: req.body.street, 
        lastWorked: req.body.lastP,
        beginNumber: req.body.beginNumber,
        endNumber: req.body.endNumber,
        taken: req.body.taken,
        description: req.body.description,
        number: req.body.number,
        kind: req.body.kind,
        congregation: req.user._id,
    });
    Territory
        .create(newTerritory)
        .then((createdTerritory) => {
            console.log(req.body.location)
            geocoder.geocode(req.body.location, function (err, data) {
                if (err || !data.length) {
                    req.flash('error', err.message);
                    return res.redirect(`/territories/new`);
                }
                console.log(data)
                if(req.body.preacher === ""){
                    createdTerritory.type="free";
                } else {
                    createdTerritory.preacher = req.body.preacher;
                }
                createdTerritory.latitude = data[0].latitude;
                createdTerritory.longitude = data[0].longitude;
                createdTerritory.location = data[0].formattedAddress;
                createdTerritory.isPhysicalCard = req.body.isPhysicalCard === 'true';
                createdTerritory.save();

                res.redirect("/territories/available");
            })
            // geocoder
            //     .forwardGeocode({
            //         query: 'Paris, France',
            //         limit: 2
            //     })
            //     .send()
            //     .then((response) => {
            //         console.log(response.body)
            //     })
            //     .catch(err => console.log(err))  
        })
        .catch((err) => console.log(err))
}

export const renderTerritoryHistory = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .populate(["preacher", "history", {
            path: "history",
            populate: {
                path: "preacher",
                model: "Preacher"
            }
        }])
        .exec()
        .then((territory) => {
            Territory
                .find({congregation: req.user._id})
                .exec()
                .then(async (territories) => {
                    const currentIndex = territories.findIndex(t => t._id.toString() === territory._id.toString());
                    const preachers = await Preacher.find({congregation: req.user._id}).exec();
                    res.render("./territories/show", {
                        header: `Teren nr ${territory.number} | Territory Manager`,
                        territory: territory,
                        countDaysFromNow: countDaysFromNow,
                        currentUser: req.user,
                        currentIndex: currentIndex,
                        groupBy,
                        preachers,
                        territories: territories
                    })
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const renderTerritoryEditForm = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .sort({number: 1})
        .populate("preacher")
        .exec()
        .then((territory) => {
            
                    res.render("./territories/edit", { 
                        currentUser: req.user, 
                        territory: territory, 
                        header: `Edytuj teren nr ${territory?.number} zboru ${req.user.username} | Territory Manager`
                    });
                
        })
        .catch((err) => console.log(err))
}

export const editTerritory = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .exec()
        .then((territory) => {
            let record = territory;
            geocoder.geocode(req.body.territory.location, async function (err, data) {
                if (err || !data.length) {
                    req.flash('error', err.message);
                    return res.redirect(`/territories/${req.user._id}/edit`);
                }
       
                        territory.latitude = data[0].latitude;
                        territory.longitude = data[0].longitude;
                        territory.location = data[0].formattedAddress;
                        territory.city = req.body.territory.city;
                        territory.street = req.body.territory.street;
                        territory.number = req.body.territory.number;
                        territory.description = req.body.territory.description;
                       
                        territory.beginNumber = req.body.territory.beginNumber;
                        territory.endNumber = req.body.territory.endNumber;
                    
                        territory.kind = req.body.territory.kind;
                        
                        territory.isPhysicalCard = req.body.territory.isPhysicalCard === 'true';
                       
                        territory.save();
                        res.redirect(`/territories/${territory._id}`);
            });
            
        })
        .catch((err) => console.log(err))
}

export const deleteTerritory = (req, res, next) => {
    Territory
        .findByIdAndDelete(req.params.territory_id)
        .exec()
        .then((territory) =>  res.redirect("/territories"))
        .catch((err) => console.log(err))
}

export const confirmDeletingTerritory = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .exec()
        .then((territory) =>{
            res.render("./territories/deleteConfirm", {
                territory: territory,
                currentUser: req.user,
                header: `Potwierdzenie usunięcia terenu | Territory Manager`
            });
        })
        .catch((err) => console.log(err))
}

export const searchAvailableTerritories = (req, res, next) => {
    if(typeof req.query.city !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.city), 'gi');
        Territory
            .find({
                $and: [
                    {city: regex}, 
                    {congregation: req.user._id}, 
                    {type: 'free'}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then(async (territories) => {
                const preachers = await Preacher.find({congregation: req.user._id}).exec();
                res.render("./territories/availableSearch", {
                    param: req.query.city, 
                    territories: territories, 
                    currentUser: req.user,
                    preachers,
                    countDaysFromNow: countDaysFromNow, 
                    header: "Wyszukiwanie wolnych terenów po miejscowości | Territory Manager"
                });
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.street !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.street), 'gi');
        Territory
            .find({
                $and: [
                    {street: regex}, 
                    {congregation: req.user._id}, 
                    {type: 'free'}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then(async (territories) => {
                const preachers = await Preacher.find({congregation: req.user._id}).exec();
                res.render("./territories/availableSearch", {
                    param: req.query.street, 
                    territories: territories, 
                    currentUser: req.user, 
                    preachers,
                    countDaysFromNow: countDaysFromNow,
                    header: "Wyszukiwanie wolnych terenów po ulicy | Territory Manager"
                });
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.number !== 'undefined'){
        
        Territory
            .find({
                $and: [
                    {number: req.query.number}, 
                    {congregation: req.user._id}, 
                    {type: 'free'}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then(async (territories) => {
                const preachers = await Preacher.find({congregation: req.user._id}).exec();
                res.render("./territories/availableSearch", {
                    param: req.query.number, 
                    territories: territories, 
                    currentUser: req.user, 
                    preachers,
                    countDaysFromNow: countDaysFromNow,
                    header: "Wyszukiwanie wolnych terenów po nr terenu | Territory Manager"
                });
            })
            .catch((err) => console.log(err))
    } else if(req.query.kind !== 'undefined'){
        Territory
            .find({
                $and: [
                    {kind: req.query.kind}, 
                    {congregation: req.user._id}, 
                    {type: 'free'}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then(async (territories) => {
                const preachers = await Preacher.find({congregation: req.user._id}).exec();
                res.render("./territories/availableSearch", {
                    param: req.query.kind, 
                    territories: territories, 
                    currentUser: req.user, 
                    preachers,
                    countDaysFromNow: countDaysFromNow,
                    header: "Wyszukiwanie wolnych terenów po nr terenu | Territory Manager"
                });
            })
            .catch((err) => console.log(err))
    }
}

export const searchChangesByDate = (req, res, next) => {
    Territory
        .find({
            $and: [{
                $or: [{ lastWorked: req.query.date }, { taken: req.query.date }]
            }]
        })
        .populate("preacher")
        .exec()
        .then((territories) => {
            Preacher
            .find({congregation: req.user._id})
            .sort({name: 1})
            .exec()
            .then((preachers) => {
                res.render('./territories/dateChanges', {
                    territories: territories,
                    date: req.query.date,
                    header: 'Wyszukiwanie po dacie | Territory Manager',
                    currentUser: req.user,
                    preachers: preachers,
                    countDaysFromNow: countDaysFromNow,
                    dateToISOString: dateToISOString
                })
            })
            .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const renderCheckoutEditForm = (req, res, next) => {
    Checkout
        .findById(req.params.checkout_id)
        .populate('preacher')
        .exec()
        .then((checkout) => {
            Preacher
            .find({congregation: req.user._id})
            .sort({name: 1})
            .exec()
            .then((preachers) => {
                res.render(`./territories/checkoutEdit`, {
                    checkout,
                    territoryID: req.params.territory_id,
                    preachers,
                    header: 'Edytuj rekord w historii terenu'
                })
            })
            .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const editCheckout = (req, res, next) => {
    Checkout
        .findByIdAndUpdate(req.params.checkout_id, req.body.checkout)
        .exec()
        .then((updatedCheckout) => res.redirect(`/territories/${req.params.territory_id}`))
        .catch((err) => console.log(err))
}

export const deleteCheckout = (req, res, next) => {
    Checkout
        .findByIdAndDelete(req.params.checkout_id)
        .exec()
        .then((deletedCheckout) => res.redirect(`/territories/${req.params.territory_id}`))
        .catch((err) => console.log(err))
}