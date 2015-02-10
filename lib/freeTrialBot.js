FreeTrialBotSchema = new SimpleSchema({
  "modified": {type: Date, autoValue: function() { return new Date(); }},
  "finished": {type: Boolean, defaultValue: false},
  "userId": {type: String},
  "email": fields.email({optional: true}),
  "name": fields.name_part({optional: true}),

  "gender": fields.gender({optional: true}),
  "expectedGraduationYear": fields.expected_graduation_year({optional: true}),
  "parent1Name": fields.name_part({optional: true}),
  "parent1Email": fields.email({optional: true}),
  "parent1Phone": fields.phone_number({optional: true}),
  "parent1CollegeName": {type: String, optional: true},
  "parent2Name": fields.name_part({optional: true}),
  "parent2Email": fields.email({optional: true}),
  "parent2Phone": fields.phone_number({optional: true}),
  "parent2CollegeName": {type: String, optional: true},
  "homeZipCode": fields.zip_code({optional: true}),
  "homeCityAndState": {type: String, optional: true},
  "race": fields.race({optional: true}),
  "oneQuestion": {type: String, optional: true},
  "oneQuestionPostToForum": {type: Boolean, optional: true},
  "highSchoolName": {type: String, optional: true},
  "highSchoolType": fields.high_school_type({optional: true}),
  "highSchoolCityState": {type: String, optional: true},
  "currentCourseTypes": fields.high_school_level({optional: true}),
  "gpa": {type: String, optional: true},
  "gpaWeighting": fields.gpa_weighting({optional: true}),
  "classRank": {type: Number, optional: true, min: 1},
  "classRankDescription": fields.class_rank_description({optional: true}),
  "classRankType": fields.class_rank_type({optional: true}),
  "act_tests": {
    optional: true,
    type: [new SimpleSchema({
      "test_date": fields.date({optional: true}),
      "english": fields.number({min: 1, max: 36, optional: true}),
      "math": fields.number({min: 1, max: 36, optional: true}),
      "reading": fields.number({min: 1, max: 36, optional: true}),
      "science": fields.number({min: 1, max: 36, optional: true}),
      "essay": fields.number({min: 1, max: 6, optional: true}),
      "composite": fields.number({min: 1, max: 36, optional: true})
    })],
  },
  "sat_tests": {
    optional: true,
    type: [new SimpleSchema({
      "test_date": fields.date({optional: true}),
      "math": fields.number({min: 200, max: 800, optional: true}),
      "reading": fields.number({min: 200, max: 800, optional: true}),
      "writing": fields.number({min: 200, max: 800, optional: true}),
      "essay": fields.number({min: 2, max: 12, optional: true}),
      "composite": fields.number({min: 600, max: 2400, optional: true})
    })],
  },
  "other_tests": {
    optional: true,
    type: [new SimpleSchema({
      "test_date": fields.date({optional: true}),
      "name_of_test": fields.string({optional: true}),
      "score": fields.string()
    })]
  },
  "favoriteSubject": { type: Object, optional: true },
  "favoriteSubject.math": {type: Boolean, optional: true},
  "favoriteSubject.science": {type: Boolean, optional: true},
  "favoriteSubject.english": {type: Boolean, optional: true},
  "favoriteSubject.historySocialStudies": {type: Boolean, optional: true},
  "favoriteSubject.foreignLanguages": {type: Boolean, optional: true},
  "favoriteSubject.other": {type: Boolean, optional: true},
  "bestSubject": { type: Object, optional: true },
  "bestSubject.math": {type: Boolean, optional: true},
  "bestSubject.science": {type: Boolean, optional: true},
  "bestSubject.english": {type: Boolean, optional: true},
  "bestSubject.historySocialStudies": {type: Boolean, optional: true},
  "bestSubject.foreignLanguages": {type: Boolean, optional: true},
  "bestSubject.other": {type: Boolean, optional: true},

  "otherActivities": {type: Object, optional: true},
  "otherActivities.art": {type: Boolean, optional: true},
  "otherActivities.music": {type: Boolean, optional: true},
  "otherActivities.communityService": {type: Boolean, optional: true},
  "otherActivities.theater": {type: Boolean, optional: true},
  "otherActivities.academicClubs": {type: Boolean, optional: true},
  "otherActivities.newspaper": {type: Boolean, optional: true},
  "otherActivities.sports": {type: Boolean, optional: true},
  "otherActivities.studentGovernment": {type: Boolean, optional: true},
  "otherActivities.job": {type: Boolean, optional: true},
  "otherActivities.other": {type: Boolean, optional: true},

  "activitiesAwards": {type: Object, optional: true},
  "activitiesAwards.local": {type: Boolean, optional: true},
  "activitiesAwards.regional": {type: Boolean, optional: true},
  "activitiesAwards.national": {type: Boolean, optional: true},
  "activitiesAwards.international": {type: Boolean, optional: true},

  "athleticRecruiting": {type: Boolean, optional: true},
  "friendsAdjectives": {type: String, optional: true},

  "dreamCollege": {type: String, optional: true},
  "dreamCollegeReasons": {type: String, optional: true},
  "financialAidIntent": {type: Boolean, optional: true},
  "studyIntent": {type: String, optional: true},

  "schoolInterests": {type: Object, optional: true},
  "schoolInterests.public": {type: Boolean, optional: true},
  "schoolInterests.private": {type: Boolean, optional: true},
  "schoolInterests.ethnicallyDiverse": {type: Boolean, optional: true},
  "schoolInterests.majorSportsProgram": {type: Boolean, optional: true},
  "schoolInterests.ethnicallySimilar": {type: Boolean, optional: true},
  "schoolInterests.researchUniversity": {type: Boolean, optional: true},
  "schoolInterests.historicallyBlack": {type: Boolean, optional: true},
  "schoolInterests.religious": {type: Boolean, optional: true},
  "schoolInterests.military": {type: Boolean, optional: true},
  "schoolInterests.liberalArts": {type: Boolean, optional: true},
  "schoolInterests.vocational": {type: Boolean, optional: true},
  "schoolInterests.singleSex": {type: Boolean, optional: true},

  "weather": {type: Object, optional: true},
  "weather.flipFlops": {type: Boolean, optional: true},
  "weather.allSeasons": {type: Boolean, optional: true},
  "weather.frozenTundra": {type: Boolean, optional: true},

  "size": {type: Object, optional: true},
  "size.small": {type: Boolean, optional: true, label: "Small (under 3,000 students)"},
  "size.medium": {type: Boolean, optional: true, label: "Medium (under 10,000 students)"},
  "size.large": {type: Boolean, optional: true, label: "Large (over 10,000 students)"},

  "city": {type: Object, optional: true},
  "city.big": {type: Boolean, optional: true},
  "city.medium": {type: Boolean, optional: true},
  "city.small": {type: Boolean, optional: true},
  "city.sticks": {type: Boolean, optional: true},
  "city.irrelevant": {type: Boolean, optional: true},

  "region": {type: Object, optional: true},
  "region.northeast": {type: Boolean, optional: true},
  "region.southeast": {type: Boolean, optional: true},
  "region.southwest": {type: Boolean, optional: true},
  "region.midwest": {type: Boolean, optional: true},
  "region.west": {type: Boolean, optional: true},
  "region.any": {type: Boolean, optional: true},

  "closeToHome": {type: String, allowedValues: ["Yes", "No", "Whatever"], optional: true},
  
  "plannedCollege1": {type: String, optional: true},
  "plannedCollege2": {type: String, optional: true},
  "plannedCollege3": {type: String, optional: true},
  "evaluation": {type: String, allowedValues: ["Awesome", "Pretty good", "meh", "lame"], optional: true},
  "evaluationRecommend": {type: String, optional: true},
  "podcastGuest": {type: Boolean, optional: true},
});
FreeTrialBots = new Mongo.Collection("freetrialbots");
FreeTrialBots.attachSchema(FreeTrialBotSchema);


var t = _.template;

FreeTrialBotStarters = new Mongo.Collection("freetrialbotstarters");
FreeTrialBotStarterSchema = new SimpleSchema({
  created: {type: Date},
  userId: {type: String},
  startBot: {type: Boolean, optional: true}
})
FreeTrialBotStarters.attachSchema(FreeTrialBotStarterSchema);

SMSWorkflows.freeTrialBotStarter = {
  name: "Free Trial Bot Starter",
  schema: FreeTrialBotStarterSchema,
  initialize: function(user, objectId, path) {
    var update = {smsWorkflow: {
      workflow: "freeTrialBotStarter",
      collection: "FreeTrialBotStarters",
      objectId: objectId,
      path: [0],
      createdAt: new Date()
    }};
    _.extend(user, update);
    UserMethods.modifyUsers(user._id, {$set: update});
  },
  finish: function(user, starter) {
    if (starter.startBot) {
      var ftb = FreeTrialBots.findOne({userId: user._id});
      var ftbid;
      if (ftb) {
        if (ftb.finished) {
          return "Looks like you've already completed the initial survey. Visit AdmitHub.com for free college admissions advice.";
        } else {
          ftbid = ftb._id;
        }
      } else {
        ftbid = FreeTrialBots.insert({userId: user._id, finished: false, modified: new Date()});
      }
      SMSWorkflows.freeTrialBot.initialize(user, ftbid);
      sms.initiate(user, "Great! ");
      return null;
    } else {
      return "Thanks anyway. Visit AdmitHub.com for free college admissions advice.";
    }
  },
  steps: [
    {prompt: t("Before we can help you, we need some standard college application info. Are you ready to get started?"), field: "startBot"}
  ]
};

SMSWorkflows.freeTrialBot = {
  name: "Free Trial Bot",
  schema: FreeTrialBotSchema,

  initialize: function(user, objectId, path) {
    var update = {smsWorkflow: {
      workflow: "freeTrialBot",
      collection: "FreeTrialBots",
      objectId: objectId,
      path: path || [0],
      createdAt: new Date()
    }};
    _.extend(user, update);
    UserMethods.modifyUsers(user._id, {$set: update});
  },

  finish: function(user, ftb) {
    // Mark trialbot finished
    FreeTrialBots.update(ftb._id, {$set: {finished: true}});
    var userUpdate = {};
    if (ftb.name) {
      userUpdate.name = ftb.name;
    }
    if (ftb.email) {
      userUpdate.emails = [{address: ftb.email, verified: false}];
    }
    _.extend(user, userUpdate);
    UserMethods.modifyUsers(user._id, {$set: userUpdate});
    return "Thanks!";
  },

  existingAppMessage: t("Thanks for signing up for the AdmitHub free trial.  You appear to have an application already underway in our system.  Please email info@admithub.com if you need a hand."),

  newFreeTrialBotMessage: t("Thanks for signing up for the AdmitHub bot.  We will help you apply to college by asking you a series of questions via text message.  In as little as five minutes per day, we’ll help you get organized and stay on track."),

  steps: [
    {field: "name", prompt: t("What is your name?"), optional: false},
    {field: "email", prompt: t("What is your email address?"), optional: false},
    {field: "gender", prompt: t("What gender do you identify as?")},
    {field: "expectedGraduationYear", prompt: t("What year do you expect to graduate?")},
    {field: "dreamCollege", prompt: t("What's your dream college?")},
    {field: "dreamCollegeReasons", prompt: t("<% if (typeof dreamCollege === 'undefined') { %>What do you want in a dream college?<% } else { %>Why is <%= dreamCollege %> your dream college?<% } %>")},
    {field: "parent1Name", prompt: t("We'd like to tell one of your parents about AdmitHub. Could you give us the name of the parent most likely to text message with us?")},
    {field: "parent1Phone", prompt: t("What is that parent's phone number?")},
    {
      field: "parent1Email",
      prompt: t("Would emailing your parents be better? Please enter their email address, or #skip to skip."), 
      skip: function(obj) {
        return !!obj.parent1Phone;
      }
    },

    // First pause.
    {
      pause: true,
      prompt: t("Nice work, that's eight down and twenty-seven more to go. Reply if you'd like to continue now. Otherwise, we'll send you a reminder later."),
      skip: function(obj) {
        // Skip this pause if it's been more than 2 hours since the last modification.
        return Date.now() - obj.modified > 1000 * 60 * 60 * 2;
      }
    },

    {field: "race", prompt: t("What race or ethnicity do you identify as?")},
    {field: "homeZipCode", prompt: t("What is your home zip code?")},
    {field: "gpa", prompt: t("Could you tell us your GPA if you know it?  If you don't have a GPA, just type #skip.")},
    {field: "classRankDescription", prompt: t("What best describes your class rank?")},
    {field: "sat_tests.0.composite", prompt: t("What is your SAT composite score (out of 2400)?")},
    {field: "act_tests.0.composite", prompt: t("What is your ACT composite score (out of 36)?")},

    // Second pause.
    {
      pause: true,
      prompt: t("Wow, that was intense! Now for thirteen more questions so we can get to know you. Reply if you want to continue now. Otherwise, we'll send you a reminder later."),
      skip: function(obj) {
        // Skip this pause if it's been more than 2 hours since the last modification.
        return Date.now() - obj.modified > 1000 * 60 * 60 * 2;
      }
    },

    {field: "friendsAdjectives", prompt: t("What adjectives would your friends use to describe you?")},
    {field: "financialAidIntent", prompt: t("Will you be applying for need-based financial aid?")},
    {field: "closeToHome", prompt: t("Would you prefer to go to college within 50 miles of home?")},
    {field: "studyIntent", prompt: t("Fill in the blank. \"In College, I want to study _____.\"")},
    {
      prompt: t("Do you have any preference about these types of schools? (please choose all that apply)"),
      multipleBooleans: [
        {field: "schoolInterests.public", prompt: t("Public")},
        {field: "schoolInterests.private", prompt: t("Private")},
        {field: "schoolInterests.religious", prompt: t("Religious")},
        {field: "schoolInterests.vocational", prompt: t("Vocational/Technical")},
        {field: "schoolInterests.historicallyBlack", prompt: t("Historically Black")},
        {field: "schoolInterests.military", prompt: t("Military")},
        {field: "schoolInterests.singleSex", prompt: t("Single Sex")},
      ]
    },
    {
      prompt: t("What other activities do you do outside of school? (Please select all that apply)"),
      multipleBooleans: [
        {field: "otherActivities.art", prompt: t("Art")},
        {field: "otherActivities.music", prompt: t("Music")},
        {field: "otherActivities.communityService", prompt: t("Community Service")},
        {field: "otherActivities.theater", prompt: t("Theater")},
        {field: "otherActivities.academicClubs", prompt: t("Academic Clubs")},
        {field: "otherActivities.newspaper", prompt: t("Newspaper")},
        {field: "otherActivities.sports", prompt: t("Sports")},
        {field: "otherActivities.studentGovernment", prompt: t("Student Government")},
        {field: "otherActivities.job", prompt: t("Job")},
        {field: "otherActivities.other", prompt: t("Other")}
      ]
    },
    {
      prompt: t("Have you received any awards or recognition for your activities?"),
      multipleBooleans: [
        {field: "activitiesAwards.local", prompt: t("local award")},
        {field: "activitiesAwards.regional", prompt: t("regional / state award")},
        {field: "activitiesAwards.national", prompt: t("national award")},
        {field: "activitiesAwards.international", prompt: t("international award")},
      ]
    },
    {
      prompt: t("What sort of weather do you prefer? Please select all that apply:"),
      multipleBooleans: [
        {field: "weather.flipFlops", prompt: t("I prefer shorts and flip-flops all the time")},
        {field: "weather.allSeasons", prompt: t("I want all the seasons")},
        {field: "weather.frozenTundra", prompt: t("A frozen tundra")},
      ]
    },

    {
      prompt: t("What size school are you looking for?"),
      multipleBooleans: [
        {field: "size.small", prompt: t("Small (under 3,000 students)")},
        {field: "size.medium", prompt: t("Medium (under 10,000 students)")},
        {field: "size.large", prompt: t("Large (over 10,000)")},
      ]
    },
    {
      prompt: t("Where is your ideal college located? Please select all that apply:"),
      multipleBooleans: [
        {field: "city.big", prompt: t("In a big city")},
        {field: "city.medium", prompt: t("In a mid-sized city or town")},
        {field: "city.small", prompt: t("In a small town")},
        {field: "city.sticks", prompt: t("In the sticks")},
        {field: "city.irrelevant", prompt: t("It doesn't matter")},
      ]
    },
    {
      prompt: t("In what region of the country would you prefer to go to college? (please select all that apply)"),
      multipleBooleans: [
        {field: "region.northeast", prompt: t("Northeast")},
        {field: "region.southeast", prompt: t("Southeast")},
        {field: "region.southwest", prompt: t("Southwest")},
        {field: "region.midwest", prompt: t("Midwest")},
        {field: "region.west", prompt: t("West")},
        {field: "region.any", prompt: t("Doesn't matter")},
      ],
    },
    {
      prompt: t("Congrats! You did a great job. We'll crunch some numbers and get back to you with the results."),
      bare: true,
      action: function(ftb) {
        FreeTrialBots.update(ftb._id, {$set: {finished: true}});
      }
    },
    {
      prompt: t("In the meantime, would you mind answering a couple of extra credit questions?"),
      branch: true,
      steps: [
        {field: "evaluation", prompt: t("What did you think of this process?")},
        {field: "evaluationRecommend", prompt: t("Would you recommend this to a friend? If so, text their phone number.  If not, text #skip.")},
        {field: "podcastGuest", prompt: t("Drew and Kirk, co-founders of AdmitHub, host a call-in podcast (https://soundcloud.com/aboutadmissions), where students ask them about admissions and they provide a lot of laughter and some helpful advice too. Would you like to be a guest on the AboutAdmissions podcast?")}
      ]
    }
  ]
}


