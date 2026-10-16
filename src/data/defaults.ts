import type {
  ApplicationData,
  EducationEntry,
  EmploymentEntry,
  ReferenceContact,
  StepDefinition,
} from '../types';

export const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const emptyEmploymentEntry = (): EmploymentEntry => ({
  id: makeId(),
  employer: '',
  jobTitle: '',
  startDate: '',
  endDate: '',
  stillEmployed: false,
  reasonForLeaving: '',
  dutiesSummary: '',
});

export const emptyEducationEntry = (): EducationEntry => ({
  id: makeId(),
  institution: '',
  qualification: '',
  yearCompleted: '',
});

const emptyReference = (): ReferenceContact => ({
  fullName: '',
  relationship: '',
  company: '',
  position: '',
  email: '',
  phone: '',
  yearsKnown: '',
});

export const createEmptyApplication = (): ApplicationData => ({
  personal: {
    title: '',
    firstName: '',
    lastName: '',
    maidenName: '',
    preferredName: '',
    dateOfBirth: '',
    nationalInsuranceNumber: '',
    previouslyApplied: '',
    howDidYouHearAboutUs: '',
  },
  contact: {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    town: '',
    county: '',
    postcode: '',
    homeTel: '',
    mobileTel1: '',
    mobileTel2: '',
    workTel: '',
    email1: '',
    email2: '',
    preferredContactMethods: [],
  },
  eligibility: {
    rightToWorkUK: '',
    requiresSponsorship: '',
    hasDrivingLicence: '',
    hasOwnTransport: '',
    hasEnhancedDbs: '',
    dbsApplicationRoute: '',
    consentToDbsCheck: false,
  },
  documents: {},
  preferences: {
    languagesSpoken: '',
    canCook: '',
    hasCulturalMeatRestriction: '',
    willingToCookMeatIfRestricted: '',
    willingToCareForPetOwners: '',
    isSmoker: '',
    willingToCareForSmokers: '',
    leisureInterests: '',
    publicDuties: '',
    availability: {
      earliestStartDate: '',
      maxHoursPerWeek: '',
      days: [],
      shiftTypes: [],
    },
  },
  employmentHistory: [emptyEmploymentEntry()],
  education: [emptyEducationEntry()],
  references: [emptyReference(), emptyReference()],
  emergencyContact: {
    title: '',
    firstName: '',
    lastName: '',
    relationship: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    postcode: '',
    homeTel: '',
    mobileTel1: '',
    mobileTel2: '',
    workTel: '',
    email: '',
  },
  declaration: {
    hasCriminalConvictions: '',
    convictionDetails: '',
    hasHealthConditionAffectingWork: '',
    healthDetails: '',
    informationAccurate: false,
    consentToReferenceChecks: false,
    consentToDataProcessing: false,
    signatureFullName: '',
    signatureDate: '',
  },
});

export const STEPS: StepDefinition[] = [
  { id: 'personal', title: 'Personal details', shortTitle: 'Personal' },
  { id: 'contact', title: 'Contact details', shortTitle: 'Contact' },
  { id: 'eligibility', title: 'Right to work & eligibility', shortTitle: 'Eligibility' },
  { id: 'preferences', title: 'Preferences & availability', shortTitle: 'Preferences' },
  { id: 'employment', title: 'Employment history', shortTitle: 'Employment' },
  { id: 'education', title: 'Education & qualifications', shortTitle: 'Education' },
  { id: 'references', title: 'References', shortTitle: 'References' },
  { id: 'emergency', title: 'Emergency contact', shortTitle: 'Next of kin' },
  { id: 'declaration', title: 'Declaration & consent', shortTitle: 'Declaration' },
  { id: 'review', title: 'Review & submit', shortTitle: 'Review' },
];

export const TITLE_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr'];

export const CONTACT_METHOD_OPTIONS = ['Home phone', 'Work phone', 'Mobile 1', 'Mobile 2', 'Email'];

export const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SHIFT_OPTIONS = ['Early', 'Late', 'Night', 'Weekend', 'Live-in'];

export const DBS_ROUTE_OPTIONS = [
  "I'll apply for my own Enhanced DBS check",
  'Please send me a link to apply for one',
];
