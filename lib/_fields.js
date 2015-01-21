SMSWorkflows = {};
SimpleSchema.messages({
  domesticPhoneNumber: "Please use a 10 digit phone number. International numbers are not supported.",
  mustAgreeToTerms: "You must agree to the terms to sign up.",
  phoneNotUnique: "This phone number is in use by another account.",
  notValidUnderscoreTemplate: "The underscore template did not compile correctly."
});

GradeTable = {
  "A+ (100 - 97)": 4,
  "A (96.9 - 93)": 4,
  "A- (92.9 - 90)": 3.7,
  "B+ (89.9 - 87)": 3.3,
  "B (86.9 – 83)": 3,
  "B- (82.9 – 80)": 2.7,
  "C+ (79.9 – 77)": 2.3,
  "C (76.9 - 73)": 2.0,
  "C- (72.9 – 70)": 1.7,
  "D+ (69.9 – 67)": 1.3,
  "D (66.9 – 63)": 1.0,
  "D- (62.9 – 60)": 0.7,
  "F (below 60)": 0
};
GradeAdjustmentTable = {
  "Regular": 0,
  "Honors": 0.5,
  "AP/IB": 1,
  "College course": 1
};

// fieldDefs are SimpleSchema field definitions.
var fieldDefs = {
  string: {type: String, max: 50},
  number: {type: Number, min: 0},
  bool: {type: Boolean},
  date: {type: Date},
  name_part: {type: String, max: 140},
  email: {type: String, regEx: SimpleSchema.RegEx.Email, max: 140},
  phone_number: {
    type: String,
    min: 10,
    max: 15,
    custom: function() {
      if (this.isSet && this.value) {
        // ensure it is 10 digits.
        if (this.value.replace(/[^\d]/g, '').length != 10) {
          return "domesticPhoneNumber";
        }
      }
    }
  },
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    max: 200
  },
  address: {type: String},
  state: {
    type: String,
    regEx: /^A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]$/
  },
  race: {
    type: String,
    allowedValues: ["I choose not to disclose my race", "American Indian or Native Alaskan", "Asian or Pacific Islander", "Black (Not of Hispanic origin)", "Hispanic", "White (Not of Hispanic origin)", "Other"],
  },
  gender: {
    type: String,
    allowedValues: ["Female", "Male", "Other"]
  },
  degree: {
    type: String,
    allowedValues: ["Bachelor's", "Master's", "JD/MBA", "PhD/MD"]
  },
  parent_marital_status: {
    type: String,
    allowedValues: ["never married", "married", "civil union/domestic partners", "widowed", "separated", "divorced"]
  },
  permanent_home_parent: {
    type: String,
    allowedValues: ["my mother", "my father", "both parents", "my legal guardian", "foster parents", "other"]
  },
  parent_role: {
    type: String,
    allowedValues: ["Mother", "Father", "Guardian"]
  },
  sibling_relationship: {
    type: String,
    allowedValues: ["Brother", "Sister", "Step-brother", "Step-sister", "Other"]
  },
  graduating_class: {
    type: Number,
    allowedValues: _.range(2014, 2025, 1)
  },
  high_school_type: {
    type: String,
    allowedValues: ["Public", "Charter", "Independent", "Religious", "Home", "Summer", "Enrichment"] 
  },
  class_rank_type: {
    type: String,
    allowedValues: ["Exact", "Percentile"]
  },
  graduating_class: {
    type: Number,
    allowedValues: _.range(2014, 2025, 1)
  },
  gpa_weighting: {
    type: String,
    allowedValues: ["Weighted", "Unweighted", "Don't know"]
  },
  high_school_year: {
    type: String,
    allowedValues: ["Freshman", "Sophomore", "Junior", "Senior"]
  },
  high_school_semester: {
    type: String,
    allowedValues: ["First Semester", "Second Semester", "Both"]
  },
  high_school_level: {
    type: String,
    allowedValues: ["Regular", "Honors", "AP/IB", "College course", "Vocational"]
  },
  high_school_grade: {
    type: String,
    allowedValues: _.sortBy(_.keys(GradeTable)).concat(["N/A"])
  },
  duration: {type: String, max: 160},
  honor_level_of_recognition: {
    type: String,
    allowedValues: ["Local", "State", "National", "International"]
  },
  essay: {
    type: String,
    max: 5000,
    min: 1
  },
  terms_and_privacy: {
    type: Boolean,
    defaultValue: false,
    label: "Agree to the Terms and Privacy Policy",
    custom: function() {
      if (this.value !== true) {
        return "mustAgreeToTerms";
      }
    }
  },
  expected_graduation_year: { type: Number, min: 2010, max: new Date().getFullYear() + 20 },
};

// fields are functions, built from fieldDefs, which take "options" to
// override or add to the default in fieldDefs.
fields = {};
_.each(fieldDefs, function(def, name) {
  fields[name] = function(options) {
    return _.extend({}, def, options);
  }
});
