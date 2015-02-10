var smsValidationSchema = new SimpleSchema({
  phone: fields.phone_number(),
  code: {type: String},
  explained: {type: Boolean, defaultValue: false},
  verified: {type: Boolean},
  date: {type: Date},
  tries: {type: Number, min: 0}
});
SmsValidations = new Mongo.Collection("smsvalidations");
SmsValidations.attachSchema(smsValidationSchema);
// Expiration of validation if the number has been verified.
SmsValidations.VERIFIED_EXPIRATION = 1000*60*60*24; // 24 hrs
// Expiration of validation if the number has not been verified -- e.g. the
// window during which verification must happen.
SmsValidations.UNVERIFIED_EXPIRATION = 1000*60*10; // 10 minutes
// Number of attempts one can make to send a code back.
SmsValidations.MAX_VERIFICATION_TRIES = 5;
SmsValidations.INITIAL_PROMPT = _.template(
  "We need to take a moment to verify that we've got the right person. " +
  "Please text back this code: <%= code %>"
);
SmsValidations.REPROMPT = _.template(
  "Sorry, that wasn't quite right. Please text back this code: <%= code %>"
);
SmsValidations.EXPIRED_PROMPT = _.template(
  "Sorry, your session expired. We need to re-verify that we've got the right person. " +
  "Please text back this code: <%= code %>"
);
SmsValidations.VERIFIED_PROMPT = _.template("Verified! Thanks.");
SmsValidations.EXPLANATION_PROMPT = _.template(
  "Welcome to AdmitHub's question bot. Here's how this works: We'll ask you a question. Answer simply by texting back.\n\nYou can send #skip to skip a question. Send STOP and we will stop texting you at all.\n\n"
)
SmsValidations.methods = {
  cleanPhone: function(phone) {
    // strip off international prefix
    return phone.replace(/^\+1/, '').replace(/[^\d]/g, '');
  },
  randomCode: function() {
    // TODO: replace with random word?
    var crypto = Meteor.npmRequire('crypto');
    return  crypto.randomBytes(3).toString('hex').toLowerCase();
  },
  getValidation: function(phone) {
    var arr = SmsValidations.find({
      phone: SmsValidations.methods.cleanPhone(phone),
    }, {sort: {date: -1}, limit: 1}).fetch();
    if (arr.length > 0) {
      return arr[0];
    }
    return null;
  },
  newValidation: function(phone, verified) {
    var insert = {
      phone: SmsValidations.methods.cleanPhone(phone),
      code: SmsValidations.methods.randomCode(),
      verified: !!verified,
      date: new Date(),
      tries: 0
    };
    insert._id = SmsValidations.insert(insert);
    return insert;
  },
  isValidating: function(smsValidation) {
    return (
      smsValidation &&
      smsValidation.verified === false &&
      smsValidation.tries < SmsValidations.MAX_VERIFICATION_TRIES - 1 &&
      Date.now() - smsValidation.date.getTime() < SmsValidations.UNVERIFIED_EXPIRATION
    );
  },
  isValid: function(smsValidation) {
    return smsValidation.verified === true && (
      Date.now() - smsValidation.date.getTime() < SmsValidations.VERIFIED_EXPIRATION
    );
  },
  incTries: function(smsValidation) {
    if (smsValidation.tries >= SmsValidations.MAX_VERIFICATION_TRIES - 1) {
      return false;
    } else {
      SmsValidations.update(smsValidation._id, {$inc: {tries: 1}});
      return true;
    }
  },
  checkCode: function(smsValidation, code) {
    return smsValidation.code === code.trim().toLowerCase();
  },
  markValid: function(smsValidation) {
    SmsValidations.update(smsValidation._id, {$set: {verified: true, date: new Date()}});
  },
  prompt: function(smsValidation) {
    return SmsValidations.INITIAL_PROMPT({code: smsValidation.code});
  },
  reprompt: function(smsValidation) {
    return SmsValidations.REPROMPT({
      code: smsValidation.code,
      tries: smsValidation.tries,
      maxTries: SmsValidations.MAX_VERIFICATION_TRIES
    });
  },
  expiredPrompt: function(smsValidation) {
    return SmsValidations.EXPIRED_PROMPT({code: smsValidation.code});
  },
  verifiedPrompt: function() {
    return SmsValidations.VERIFIED_PROMPT();
  },
  explainOnce: function(phone) {
    var smsValidation = SmsValidations.methods.getValidation(phone);
    if (smsValidation.explained) {
      return null;
    }
    SmsValidations.update(smsValidation._id, {$set: {explained: true}});
    return SmsValidations.EXPLANATION_PROMPT();
  }
};
