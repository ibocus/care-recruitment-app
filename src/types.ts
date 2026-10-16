import type { ApplicationStage, DbsStatus, RtwStatus, StageHistoryEntry } from './data/pipeline.js';

export type YesNo = 'yes' | 'no' | '';

export interface PersonalDetails {
  title: string;
  firstName: string;
  lastName: string;
  maidenName: string;
  preferredName: string;
  dateOfBirth: string;
  nationalInsuranceNumber: string;
  previouslyApplied: YesNo;
  howDidYouHearAboutUs: string;
}

export interface ContactDetails {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  town: string;
  county: string;
  postcode: string;
  homeTel: string;
  mobileTel1: string;
  mobileTel2: string;
  workTel: string;
  email1: string;
  email2: string;
  preferredContactMethods: string[];
}

export type DocumentSlot = 'rightToWorkEvidence' | 'dbsCertificate';

export interface UploadedDocument {
  pathname: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export type ApplicationDocuments = Partial<Record<DocumentSlot, UploadedDocument>>;

export interface EligibilityDetails {
  rightToWorkUK: YesNo;
  requiresSponsorship: YesNo;
  hasDrivingLicence: YesNo;
  hasOwnTransport: YesNo;
  hasEnhancedDbs: YesNo;
  dbsApplicationRoute: string;
  consentToDbsCheck: boolean;
}

export interface Availability {
  earliestStartDate: string;
  maxHoursPerWeek: string;
  days: string[];
  shiftTypes: string[];
}

export interface Preferences {
  languagesSpoken: string;
  canCook: YesNo;
  hasCulturalMeatRestriction: YesNo;
  willingToCookMeatIfRestricted: YesNo;
  willingToCareForPetOwners: YesNo;
  isSmoker: YesNo;
  willingToCareForSmokers: YesNo;
  leisureInterests: string;
  publicDuties: string;
  availability: Availability;
}

export interface EmploymentEntry {
  id: string;
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  stillEmployed: boolean;
  reasonForLeaving: string;
  dutiesSummary: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  qualification: string;
  yearCompleted: string;
}

export interface ReferenceContact {
  fullName: string;
  relationship: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  yearsKnown: string;
}

export interface EmergencyContact {
  title: string;
  firstName: string;
  lastName: string;
  relationship: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  postcode: string;
  homeTel: string;
  mobileTel1: string;
  mobileTel2: string;
  workTel: string;
  email: string;
}

export interface Declaration {
  hasCriminalConvictions: YesNo;
  convictionDetails: string;
  hasHealthConditionAffectingWork: YesNo;
  healthDetails: string;
  informationAccurate: boolean;
  consentToReferenceChecks: boolean;
  consentToDataProcessing: boolean;
  signatureFullName: string;
  signatureDate: string;
}

export interface ApplicationData {
  personal: PersonalDetails;
  contact: ContactDetails;
  eligibility: EligibilityDetails;
  documents: ApplicationDocuments;
  preferences: Preferences;
  employmentHistory: EmploymentEntry[];
  education: EducationEntry[];
  references: [ReferenceContact, ReferenceContact];
  emergencyContact: EmergencyContact;
  declaration: Declaration;
}

export interface StepDefinition {
  id: string;
  title: string;
  shortTitle: string;
}

export interface ApplicationSummary {
  id: string;
  reference_id: string;
  applicant_name: string | null;
  email: string | null;
  phone: string | null;
  stage: ApplicationStage;
  rtw_status: RtwStatus;
  dbs_status: DbsStatus;
  created_at: string;
}

export interface ApplicationRecord extends ApplicationSummary {
  payload: ApplicationData;
  closed_reason: string | null;
  stage_history: StageHistoryEntry[];
}
