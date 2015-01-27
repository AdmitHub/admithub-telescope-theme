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
  "parent2Phone": fields.email({optional: true}),
  "parent2CollegeName": {type: String, optional: true},
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
      "essay": fields.number({min: 2, max: 12, optional: true})
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
  "athleticRecruiting": {type: Boolean, optional: true},
  "friendsAdjectives": {type: String, optional: true},

  "dreamCollege": {type: String, optional: true},
  "dreamCollegeReasons": {type: String, optional: true},
  "financialAidIntent": {type: Boolean, optional: true},
  "studyIntent": {type: String, optional: true},

  "schoolInterests": {type: Object, optional: true},
  "schoolInterests.ethnicallyDiverse": {type: Boolean, optional: true},
  "schoolInterests.majorSportsProgram": {type: Boolean, optional: true},
  "schoolInterests.ethnicallySimilar": {type: Boolean, optional: true},
  "schoolInterests.researchUniversity": {type: Boolean, optional: true},
  "schoolInterests.historicallyBlack": {type: Boolean, optional: true},
  "schoolInterests.religious": {type: Boolean, optional: true},
  "schoolInterests.military": {type: Boolean, optional: true},
  "schoolInterests.liberalArts": {type: Boolean, optional: true},
  "schoolInterests.vocational": {type: Boolean, optional: true},

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

  "closeToHome": {type: String, allowedValues: ["Yes", "No", "Whatever"], optional: true},
  
  "plannedCollege1": {type: String, optional: true},
  "plannedCollege2": {type: String, optional: true},
  "plannedCollege3": {type: String, optional: true},
  "evaluation": {type: String, allowedValues: ["Awesome", "Pretty good", "meh", "lame"], optional: true},
  "evaluationRecommend": {type: String, optional: true}
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
    Meteor.users.update(user._id, {$set: update});
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
    Meteor.users.update(user._id, {$set: update});
  },

  finish: function(user, ftb) {
    // Mark trialbot finished
    FreeTrialBots.update(ftb._id, {$set: {finished: true}});
    // TODO: Do something with referrals, oneQuestion, etc.
    var userUpdate = {};
    if (ftb.name) {
      userUpdate.name = ftb.name;
    }
    if (ftb.email) {
      userUpdate.emails = [{address: ftb.email, verified: false}];
    }
    _.extend(user, userUpdate);
    Meteor.users.update(user._id, {$set: userUpdate});
    return "Thanks!";
  },

  existingAppMessage: t("Thanks for signing up for the AdmitHub free trial.  You appear to have an application already underway in our system.  Please email info@admithub.com if you need a hand."),

  newFreeTrialBotMessage: t("Thanks for signing up for the AdmitHub bot.  We will help you apply to college by asking you a series of questions via text message.  In as little as five minutes per day, we’ll help you get organized and stay on track."),

  steps: [
    {prompt: t("What is your name?"), field: "name", optional: false},
    {prompt: t("What is your email address?"), field: "email", optional: false},
    // TODO
    /*
    {
      prompt: t("Thanks <%= name %>. Now that we're no longer strangers, here's our contact information for you to save on your phone."),
      mms: t("BEGIN:VCARD\nVERSION:2.1\nFN:AdmitHub\nORG:AdmitHub\nTITLE:AdmitHub\nTEL:WORK;VOICE:")
      bare: true
    },
    */
    {field: "gender", prompt: t("What gender do you identify as?")},
    {field: "expectedGraduationYear", prompt: t("What year do you expect to graduate?")},
    {field: "parent1Name", prompt: t("What is one of your parent or guardian's names?")},
    {field: "parent1Email", prompt: t("What is that parent's email?")},
    {field: "parent1Phone", prompt: t("What is that parent's phone number?")},
    {field: "parent1CollegeName", prompt: t("What college did that parent attend, if any? (type #skip to skip)")},
    {field: "parent2Name", prompt: t("If you have a second parent or guardian, what is their name? (type #skip to skip)")},
    {field: "parent2Email", prompt: t("What is that parent's email? (type #skip to skip)")},
    {field: "parent2Phone", prompt: t("What is that parent's phone number? (type #skip to skip)")},
    {field: "parent2CollegeName", prompt: t("What college did that parent attend, if any? (type #skip to skip)")},
    {field: "homeCityAndState", prompt: t("What is your home city and state?")},
    {field: "race", prompt: t("What race or ethnicity do you identify as?")},
    {field: "oneQuestion", prompt: t("If you could ask an admissions officer anything, what would you ask?")},
    {field: "oneQuestionPostToForum", prompt: t("Would you like to post that question to our forum?")},
    {field: "highSchoolName", prompt: t("What is the name of your current high school?")},
    {field: "highSchoolType", prompt: t("What type of school is it?")},
    {field: "highSchoolCityState", prompt: t("What city and state is the school in?")},
    {field: "currentCourseTypes", prompt: t("What types of courses are you currently taking?")},

    {field: "gpa", prompt: t("Could you tell us your GPA if you know it?  If you don't have a GPA, just type #skip.")},
    {field: "gpaWeighting", prompt: t("Is your GPA:")},
    {field: "classRank", prompt: t("What is your current class rank, if you know it? (either exact number, or percentile)")},
    {field: "classRankType", prompt: t("This class rank is reported as:")},
        {
      name: "Standardized Tests",
      steps: [
        {
          prompt: t("How many times have you taken the SAT?"),
          loopn: true,
          steps: [
            {
              prompt: t("When did you take the <%= nth %> SAT test?"),
              field: "sat_tests.$.test_date"
            },
            {
              prompt: t("What was your Math score on the <%= nth %> SAT test?"),
              field: "sat_tests.$.math"
            },
            {
              prompt: t("What was your Critical Reading score on the <%= nth %> SAT test?"),
              field: "sat_tests.$.reading"
            },
            {
              prompt: t("What was your Writing score on the <%= nth %> SAT test?"),
              field: "sat_tests.$.writing"
            },
            {
              prompt: t("What was your Essay score on the <%= nth %> SAT test?"),
              field: "sat_tests.$.essay"
            }
          ]
        },
        {
          prompt: t("How many times have you taken the ACT?"),
          loopn: true,
          steps: [
            {
              prompt: t("When did you take the <%= nth %> ACT test?"),
              field: "act_tests.$.test_date"
            },
            {
              prompt: t("What was your english score on the <%= nth %> ACT test?"),
              field: "act_tests.$.english"
            },
            {
              prompt: t("What was your math score on the <%= nth %> ACT test?"),
              field: "act_tests.$.math"
            },
            {
              prompt: t("What was your reading score on the <%= nth %> ACT test?"),
              field: "act_tests.$.reading"
            },
            {
              prompt: t("What was your science score on the <%= nth %> ACT test?"),
              field: "act_tests.$.science"
            },
            {
              prompt: t("What was your essay score on the <%= nth %> ACT test?"),
              field: "act_tests.$.essay"
            },
            {
              prompt: t("What was your composite score on the <%= nth %> ACT test?"),
              field: "act_tests.$.composite"
            }
          ]
        },
        {
          prompt: t("Other than SAT and ACT, how many other standardized tests have you taken?"),
          loopn: true,
          steps: [
            {
              prompt: t("What was the name of the <%= nth %> other test?"),
              field: "other_tests.$.name_of_test"
            },
            {
              prompt: t("When did you take this test?"),
              field: "other_tests.$.test_date",
              optional: false
            },
            {
              prompt: t("What were your scores?"),
              field: "other_tests.$.score"
            }
          ]
        }
      ]
    },
    {
      prompt: t("What's your favorite subject? (List all that apply, e.g. \"1, 3, 5\")"),
      multipleBooleans: [
        {field: "favoriteSubject.math", prompt: t("Math")},
        {field: "favoriteSubject.science", prompt: t("Science")},
        {field: "favoriteSubject.english", prompt: t("English")},
        {field: "favoriteSubject.historySocialStudies", prompt: t("History / Social Studies")},
        {field: "favoriteSubject.foreignLanguages", prompt: t("Foreign Languages")},
        {field: "favoriteSubject.other", prompt: t("Other")}
      ]
    },
    {
      prompt: t("What's your *best* subject? (List all that apply, e.g. \"1, 3, 5\")"),
      multipleBooleans: [
        {field: "bestSubject.math", prompt: t("Math")},
        {field: "bestSubject.science", prompt: t("Science")},
        {field: "bestSubject.english", prompt: t("English")},
        {field: "bestSubject.historySocialStudies", prompt: t("History / Social Studies")},
        {field: "bestSubject.foreignLanguages", prompt: t("Foreign Languages")},
        {field: "bestSubject.other", prompt: t("Other")}
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
    {field: "athleticRecruiting", prompt: t("Are you planning to pursue the athletic recruiting process?")},
    {field: "friendsAdjectives", prompt: t("What adjectives would your friends use to describe you?")},
    {field: "dreamCollege", prompt: t("What's your dream college?")},
    {field: "dreamCollegeReasons", prompt: t("<% if (typeof dreamCollege === 'undefined') { %>What do you want in a dream college?<% } else { %>Why is <%= dreamCollege %> your dream college?<% } %>")},
    {field: "financialAidIntent", prompt: t("Will you be applying for need-based financial aid?")},
    {field: "studyIntent", prompt: t("Fill in the blank. \"In College, I want to study _____.\"")},
    {
      prompt: t("Which of these types of schools interest you? Please select all that apply:"),
      multipleBooleans: [
        {field: "schoolInterests.ethnicallyDiverse", prompt: t("Ethnically Diverse")},
        {field: "schoolInterests.majorSportsProgram", prompt: t("Major Sports Program")},
        {field: "schoolInterests.ethnicallySimilar", prompt: t("Ethnically Similar")},
        {field: "schoolInterests.researchUniversity", prompt: t("Research University")},
        {field: "schoolInterests.historicallyBlack", prompt: t("Historically Black")},
        {field: "schoolInterests.religious", prompt: t("Religious")},
        {field: "schoolInterests.military", prompt: t("Military")},
        {field: "schoolInterests.liberalArts", prompt: t("Liberal Arts")},
        {field: "schoolInterests.vocational", prompt: t("Vocational/Technical")},
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
    {field: "closeToHome", prompt: t("Would you prefer to go to college within 50 miles of home?")},
    {
      prompt: t("Tell us three other colleges where you plan to apply."),
      bare: true
    },
    {field: "plannedCollege1", prompt: t("What is the 1st additional college?")},
    {field: "plannedCollege2", prompt: t("What is the 2nd additional college?")},
    {field: "plannedCollege3", prompt: t("What is the 3rd additional college?")},
    {
      prompt: t("Thanks for all the info, you're done for now. We'll crunch the data and get back to you with some school suggestions based on your preferences. In the mean time, you can ask us anything at http://AboutAdmissions.com."),
      bare: true
    },
    {field: "evaluation", prompt: t("What did you think of this process?")},
    {
      prompt: t("Would you recommend it to your friends?"),
      branch: true,
      steps: [
        {
          field: "evaluationRecommend",
          prompt: t("Great. Text us contact info and we'll reach out to them.")}
      ]
    },
  ]
}


