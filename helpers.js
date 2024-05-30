import mailgun from 'mailgun-js';
import Checkout from './models/checkout.js';

export const isLoggedIn = (req, res, next)  => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Prosimy zaloguj się najpierw");
    res.redirect("/login");
}

export const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

export const countDaysFromNow = (date) => {
    return Math.round(Math.abs(new Date() - new Date(date)) / 86400000);
}

export const months = [
    'Styczeń', 
    'Luty', 
    'Marzec', 
    'Kwiecień', 
    'Maj', 
    'Czerwiec', 
    'Lipiec', 
    'Sierpień', 
    'Wrzesień', 
    'Październik', 
    'Listopad', 
    'Grudzień'
];

export const sendEmail = async (subject, to, text, congregation) => {
    const DOMAIN = 'websiteswithpassion.pl';
    const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host: "api.eu.mailgun.net" });
    const mailgunVariables = JSON.stringify({
        text: text,
        username: congregation.username,
        verificationCode: congregation.verificationNumber,
    })
    const data = {
        from: `Weryfikacja konta Congregation Planner <admin@websiteswithpassion.pl>`,
        to: to,
        subject: subject,
        template: 'weryfikacja territory manager',
        'h:X-Mailgun-Variables': mailgunVariables
    };
    mg.messages().send(data, function (error, body) {
        if (error) {
            console.log(error)
        }
    });
}

export const dateToISOString = (date) => {
    let newDate = new Date();
    newDate.setDate(date);
    return newDate.toISOString().slice(0, 10);
}

export const createCheckout = async (territory, body) => {
    let date = new Date();
    const serviceYear = date.getMonth() <= 7 ? date.getFullYear() : date.getFullYear() + 1;
    const createdCheckout = await Checkout.create({ preacher: territory.preacher, takenDate: territory.taken, passedBackDate: body.lastWorked, serviceYear  })
    return createdCheckout;
}

export const groupBy = function(data, key) {
    return data.reduce(function(storage, item) {
        let group = item[key];
        
        storage[group] = storage[group] || [];
        
        storage[group].push(item);
        
        return storage; 
      }, {});
  };

  export const chooseMeetingTypeColorAndIcon = (type) => {
    let fontColor;
    let iconName;
  switch (type) {
    case "Studium Strażnicy": {
      fontColor = "#588D3F";
      iconName = 'fa-solid fa-book-open' ;
      break;
    }
    case "Wykład biblijny": {
      fontColor = "#292929";
      iconName = 'fa-solid fa-book-bookmark';
      break;
    }
    case "Skarby ze Słowa Bożego": {
      fontColor = "#2A6B77";
      iconName = 'fa-regular fa-gem';
      break;
    }
    case "Ulepszajmy swoją służbę": {
      fontColor = "#9B6D17";
      iconName = 'fa-solid fa-briefcase';
      break;
    }
    case "Chrześcijański tryb życia": {
      fontColor = "#942926";
      iconName = 'fa-regular fa-circle-up';
      break;
    }
    default: {
      break;
    }
  }

  return { iconName, fontColor }
};