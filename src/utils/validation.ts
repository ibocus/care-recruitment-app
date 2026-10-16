import type { ApplicationData } from '../types';

export type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UK_PHONE_RE = /^(\+44\s?|0)(\d\s?){9,10}$/;
const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
const NI_RE = /^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}\d{6}[A-D]$/i;

const required = (value: string, message = 'This field is required') =>
  value.trim() === '' ? message : '';

const optionalPattern = (value: string, pattern: RegExp, message: string) =>
  value.trim() === '' || pattern.test(value.trim()) ? '' : message;

export function validatePersonal(data: ApplicationData): Errors {
  const { personal } = data;
  const errors: Errors = {};
  errors.title = required(personal.title);
  errors.firstName = required(personal.firstName);
  errors.lastName = required(personal.lastName);
  errors.dateOfBirth = required(personal.dateOfBirth);
  errors.nationalInsuranceNumber = optionalPattern(
    personal.nationalInsuranceNumber,
    NI_RE,
    'Enter a valid National Insurance number, e.g. QQ123456C',
  );
  errors.previouslyApplied = required(personal.previouslyApplied, 'Please choose an option');
  return stripEmpty(errors);
}

export function validateContact(data: ApplicationData): Errors {
  const { contact } = data;
  const errors: Errors = {};
  errors.addressLine1 = required(contact.addressLine1);
  errors.town = required(contact.town);
  errors.postcode = required(contact.postcode) || optionalPattern(contact.postcode, UK_POSTCODE_RE, 'Enter a valid UK postcode');
  errors.mobileTel1 = required(contact.mobileTel1) || optionalPattern(contact.mobileTel1, UK_PHONE_RE, 'Enter a valid UK phone number');
  errors.homeTel = optionalPattern(contact.homeTel, UK_PHONE_RE, 'Enter a valid UK phone number');
  errors.mobileTel2 = optionalPattern(contact.mobileTel2, UK_PHONE_RE, 'Enter a valid UK phone number');
  errors.workTel = optionalPattern(contact.workTel, UK_PHONE_RE, 'Enter a valid UK phone number');
  errors.email1 = required(contact.email1) || optionalPattern(contact.email1, EMAIL_RE, 'Enter a valid email address');
  errors.email2 = optionalPattern(contact.email2, EMAIL_RE, 'Enter a valid email address');
  if (contact.preferredContactMethods.length === 0) {
    errors.preferredContactMethods = 'Choose at least one contact method';
  }
  return stripEmpty(errors);
}

export function validateEligibility(data: ApplicationData): Errors {
  const { eligibility } = data;
  const errors: Errors = {};
  errors.rightToWorkUK = required(eligibility.rightToWorkUK, 'Please choose an option');
  if (!data.documents?.rightToWorkEvidence) {
    errors.rightToWorkEvidence = 'Please upload evidence of your right to work';
  }
  errors.hasDrivingLicence = required(eligibility.hasDrivingLicence, 'Please choose an option');
  errors.hasOwnTransport = required(eligibility.hasOwnTransport, 'Please choose an option');
  if (eligibility.hasEnhancedDbs !== 'yes') {
    errors.dbsApplicationRoute = required(eligibility.dbsApplicationRoute, 'Please choose an option');
  }
  if (!eligibility.consentToDbsCheck) {
    errors.consentToDbsCheck = 'Consent is required to proceed with your application';
  }
  return stripEmpty(errors);
}

export function validatePreferences(data: ApplicationData): Errors {
  const { preferences } = data;
  const errors: Errors = {};
  errors.canCook = required(preferences.canCook, 'Please choose an option');
  errors.isSmoker = required(preferences.isSmoker, 'Please choose an option');
  errors.willingToCareForPetOwners = required(preferences.willingToCareForPetOwners, 'Please choose an option');
  if (preferences.availability.days.length === 0) {
    errors['availability.days'] = 'Select at least one available day';
  }
  if (preferences.availability.shiftTypes.length === 0) {
    errors['availability.shiftTypes'] = 'Select at least one shift type';
  }
  errors['availability.earliestStartDate'] = required(preferences.availability.earliestStartDate, 'Please provide your earliest start date');
  return stripEmpty(errors);
}

export function validateEmployment(data: ApplicationData): Errors {
  const errors: Errors = {};
  const isBlank = (entry: (typeof data.employmentHistory)[number]) =>
    entry.employer.trim() === '' && entry.jobTitle.trim() === '';

  if (data.employmentHistory.every(isBlank)) {
    errors['employmentHistory.0.employer'] = 'Please provide at least one employer';
  }

  data.employmentHistory.forEach((entry, i) => {
    if (isBlank(entry)) return;
    if (required(entry.employer)) errors[`employmentHistory.${i}.employer`] = 'Required';
    if (required(entry.jobTitle)) errors[`employmentHistory.${i}.jobTitle`] = 'Required';
    if (required(entry.startDate)) errors[`employmentHistory.${i}.startDate`] = 'Required';
    if (!entry.stillEmployed && required(entry.endDate)) {
      errors[`employmentHistory.${i}.endDate`] = 'Required, or tick "still employed here"';
    }
  });
  return stripEmpty(errors);
}

export function validateEducation(_data: ApplicationData): Errors {
  return {};
}

export function validateReferences(data: ApplicationData): Errors {
  const errors: Errors = {};
  data.references.forEach((ref, i) => {
    if (required(ref.fullName)) errors[`references.${i}.fullName`] = 'Required';
    if (required(ref.relationship)) errors[`references.${i}.relationship`] = 'Required';
    const phoneOrEmail = ref.phone.trim() || ref.email.trim();
    if (!phoneOrEmail) {
      errors[`references.${i}.phone`] = 'Provide a phone number or email';
    } else {
      if (ref.email.trim() && !EMAIL_RE.test(ref.email.trim())) {
        errors[`references.${i}.email`] = 'Enter a valid email address';
      }
    }
  });
  return stripEmpty(errors);
}

export function validateEmergencyContact(data: ApplicationData): Errors {
  const { emergencyContact } = data;
  const errors: Errors = {};
  errors.firstName = required(emergencyContact.firstName);
  errors.lastName = required(emergencyContact.lastName);
  errors.relationship = required(emergencyContact.relationship);
  errors.mobileTel1 = required(emergencyContact.mobileTel1) || optionalPattern(emergencyContact.mobileTel1, UK_PHONE_RE, 'Enter a valid UK phone number');
  return stripEmpty(errors);
}

export function validateDeclaration(data: ApplicationData): Errors {
  const { declaration } = data;
  const errors: Errors = {};
  errors.hasCriminalConvictions = required(declaration.hasCriminalConvictions, 'Please choose an option');
  if (declaration.hasCriminalConvictions === 'yes' && required(declaration.convictionDetails)) {
    errors.convictionDetails = 'Please provide details';
  }
  errors.hasHealthConditionAffectingWork = required(declaration.hasHealthConditionAffectingWork, 'Please choose an option');
  if (declaration.hasHealthConditionAffectingWork === 'yes' && required(declaration.healthDetails)) {
    errors.healthDetails = 'Please provide details';
  }
  if (!declaration.informationAccurate) errors.informationAccurate = 'You must confirm this to continue';
  if (!declaration.consentToReferenceChecks) errors.consentToReferenceChecks = 'You must consent to continue';
  if (!declaration.consentToDataProcessing) errors.consentToDataProcessing = 'You must consent to continue';
  errors.signatureFullName = required(declaration.signatureFullName, 'Type your full name to sign');
  errors.signatureDate = required(declaration.signatureDate);
  return stripEmpty(errors);
}

export function validateStep(stepId: string, data: ApplicationData): Errors {
  switch (stepId) {
    case 'personal':
      return validatePersonal(data);
    case 'contact':
      return validateContact(data);
    case 'eligibility':
      return validateEligibility(data);
    case 'preferences':
      return validatePreferences(data);
    case 'employment':
      return validateEmployment(data);
    case 'education':
      return validateEducation(data);
    case 'references':
      return validateReferences(data);
    case 'emergency':
      return validateEmergencyContact(data);
    case 'declaration':
      return validateDeclaration(data);
    default:
      return {};
  }
}

export function stripEmpty(errors: Errors): Errors {
  const result: Errors = {};
  for (const [key, value] of Object.entries(errors)) {
    if (value) result[key] = value;
  }
  return result;
}

export function isStepValid(stepId: string, data: ApplicationData): boolean {
  return Object.keys(validateStep(stepId, data)).length === 0;
}
