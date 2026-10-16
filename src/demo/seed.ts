// Fictional sample candidates for demo mode. Names, emails (example.com),
// phone numbers (Ofcom's 07700 900xxx drama range) and addresses are invented.
import { createEmptyApplication, makeId } from '../data/defaults';
import { DBS_ROUTE_OPTIONS } from '../data/defaults';
import type { ApplicationStage, DbsStatus, RtwStatus, StageHistoryEntry } from '../data/pipeline';
import type { ApplicationData, ApplicationRecord, DocumentSlot } from '../types';

export interface DemoDocument {
  contentType: string;
  dataUrl: string;
}

const DAY = 24 * 60 * 60 * 1000;
// A timestamp `daysAgo` days back at the given hour, never later than an hour
// ago, so sample data always sorts below anything submitted during the demo.
const at = (daysAgo: number, hour = 10) => {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(hour, 15, 0, 0);
  const latest = Date.now() - 60 * 60 * 1000;
  return new Date(Math.min(d.getTime(), latest)).toISOString();
};

function sampleDocSvg(title: string, lines: string[]): string {
  const body = lines
    .map((l, i) => `<text x="40" y="${200 + i * 34}" font-size="20" fill="#334155">${l}</text>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
<rect width="800" height="560" fill="#f8fafc"/><rect x="20" y="20" width="760" height="520" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
<text x="40" y="80" font-family="Arial" font-size="30" font-weight="bold" fill="#0f172a">${title}</text>
<text x="40" y="120" font-family="Arial" font-size="18" fill="#b91c1c">SAMPLE DOCUMENT — DEMO DATA ONLY</text>
<g font-family="Arial">${body}</g>
<text x="400" y="420" font-family="Arial" font-size="72" fill="#e2e8f0" text-anchor="middle" transform="rotate(-18 400 420)">SAMPLE</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface SeedSpec {
  first: string;
  last: string;
  title: string;
  town: string;
  postcode: string;
  phoneTail: string;
  daysAgo: number;
  stage: ApplicationStage;
  rtw: RtwStatus;
  dbs: DbsStatus;
  dbsRoute: 0 | 1;
  hasDbsCert: boolean;
  employer: string;
  jobTitle: string;
  history: Array<[ApplicationStage, number, string]>; // stage, days ago, note
  closedReason?: string;
}

const SPECS: SeedSpec[] = [
  { first: 'Amara', last: 'Okafor', title: 'Ms', town: 'Harrow', postcode: 'HA1 2AB', phoneTail: '101', daysAgo: 0,
    stage: 'right_to_work_check', rtw: 'pending', dbs: 'pending', dbsRoute: 1, hasDbsCert: false,
    employer: 'Sunrise Care Home', jobTitle: 'Care Assistant', history: [] },
  { first: 'Daniel', last: 'Kowalski', title: 'Mr', town: 'Ealing', postcode: 'W5 3CD', phoneTail: '102', daysAgo: 1,
    stage: 'right_to_work_check', rtw: 'pending', dbs: 'pending', dbsRoute: 0, hasDbsCert: true,
    employer: 'Brightside Homecare', jobTitle: 'Support Worker', history: [] },
  { first: 'Priya', last: 'Sharma', title: 'Mrs', town: 'Wembley', postcode: 'HA9 4EF', phoneTail: '103', daysAgo: 3,
    stage: 'interview', rtw: 'passed', dbs: 'pending', dbsRoute: 1, hasDbsCert: false,
    employer: 'Northwick Hospital (bank)', jobTitle: 'Healthcare Assistant',
    history: [['interview', 2, 'Right to work check passed']] },
  { first: 'Kwame', last: 'Mensah', title: 'Mr', town: 'Hounslow', postcode: 'TW3 5GH', phoneTail: '104', daysAgo: 4,
    stage: 'interview', rtw: 'passed', dbs: 'pending', dbsRoute: 0, hasDbsCert: false,
    employer: 'Greenway Supported Living', jobTitle: 'Support Worker',
    history: [['interview', 3, 'Right to work check passed']] },
  { first: 'Sofia', last: 'Rossi', title: 'Miss', town: 'Barnet', postcode: 'EN5 6JK', phoneTail: '105', daysAgo: 8,
    stage: 'references_dbs', rtw: 'passed', dbs: 'link_sent', dbsRoute: 1, hasDbsCert: false,
    employer: 'Meadow View Nursing Home', jobTitle: 'Senior Carer',
    history: [['interview', 7, 'Right to work check passed'], ['references_dbs', 5, 'Interview passed']] },
  { first: 'Hannah', last: 'Clarke', title: 'Ms', town: 'Uxbridge', postcode: 'UB8 7LM', phoneTail: '106', daysAgo: 10,
    stage: 'references_dbs', rtw: 'passed', dbs: 'completed', dbsRoute: 0, hasDbsCert: true,
    employer: 'Oakfield Homecare', jobTitle: 'Care Worker',
    history: [['interview', 9, 'Right to work check passed'], ['references_dbs', 7, 'Interview passed']] },
  { first: 'Yusuf', last: 'Ali', title: 'Mr', town: 'Brent', postcode: 'NW10 8NP', phoneTail: '107', daysAgo: 16,
    stage: 'offer', rtw: 'passed', dbs: 'completed', dbsRoute: 0, hasDbsCert: true,
    employer: 'Willow Lodge', jobTitle: 'Care Assistant',
    history: [['interview', 15, 'Right to work check passed'], ['references_dbs', 13, 'Interview passed'], ['offer', 4, 'References and DBS satisfied']] },
  { first: 'Grace', last: 'Adeyemi', title: 'Mrs', town: 'Hayes', postcode: 'UB3 9QR', phoneTail: '108', daysAgo: 21,
    stage: 'offer', rtw: 'passed', dbs: 'completed', dbsRoute: 1, hasDbsCert: false,
    employer: 'Riverside Care Services', jobTitle: 'Domiciliary Carer',
    history: [['interview', 20, 'Right to work check passed'], ['references_dbs', 17, 'Interview passed'], ['offer', 6, 'References and DBS satisfied']] },
  { first: 'Tom', last: 'Fletcher', title: 'Mr', town: 'Edgware', postcode: 'HA8 1ST', phoneTail: '109', daysAgo: 6,
    stage: 'closed_not_eligible', rtw: 'failed', dbs: 'pending', dbsRoute: 0, hasDbsCert: false,
    employer: 'Self-employed', jobTitle: 'Driver',
    history: [['closed_not_eligible', 5, 'No valid right to work evidence provided']],
    closedReason: 'No valid right to work evidence provided' },
];

function payloadFor(s: SeedSpec, ref: string): ApplicationData {
  const d = createEmptyApplication();
  d.personal = { ...d.personal, title: s.title, firstName: s.first, lastName: s.last, dateOfBirth: '1990-04-12',
    previouslyApplied: 'no', howDidYouHearAboutUs: 'Indeed' };
  d.contact = { ...d.contact, addressLine1: `${10 + Number(s.phoneTail) % 40} Example Road`, town: s.town,
    county: 'Greater London', postcode: s.postcode, mobileTel1: `07700 900${s.phoneTail}`,
    email1: `${s.first}.${s.last}@example.com`.toLowerCase(), preferredContactMethods: ['Mobile 1', 'Email'] };
  d.eligibility = { ...d.eligibility, rightToWorkUK: s.rtw === 'failed' ? 'no' : 'yes', requiresSponsorship: 'no',
    hasDrivingLicence: 'yes', hasOwnTransport: s.daysAgo % 2 ? 'yes' : 'no', hasEnhancedDbs: s.hasDbsCert ? 'yes' : 'no',
    dbsApplicationRoute: DBS_ROUTE_OPTIONS[s.dbsRoute], consentToDbsCheck: true };
  const docs: ApplicationData['documents'] = {};
  if (s.rtw !== 'failed') {
    docs.rightToWorkEvidence = { pathname: `demo/${ref}/rightToWorkEvidence`, originalName: 'share-code-check.png',
      contentType: 'image/svg+xml', size: 48211, uploadedAt: at(s.daysAgo) };
  }
  if (s.hasDbsCert) {
    docs.dbsCertificate = { pathname: `demo/${ref}/dbsCertificate`, originalName: 'enhanced-dbs.pdf',
      contentType: 'image/svg+xml', size: 102334, uploadedAt: at(s.daysAgo) };
  }
  d.documents = docs;
  d.preferences = { ...d.preferences, languagesSpoken: 'English', canCook: 'yes', willingToCareForPetOwners: 'yes',
    isSmoker: 'no', willingToCareForSmokers: 'yes',
    availability: { earliestStartDate: at(-14).slice(0, 10), maxHoursPerWeek: '37', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], shiftTypes: ['Early', 'Late'] } };
  d.employmentHistory = [{ id: makeId(), employer: s.employer, jobTitle: s.jobTitle, startDate: '2022-03-01', endDate: '',
    stillEmployed: true, reasonForLeaving: '', dutiesSummary: 'Personal care, medication prompts, meal preparation and companionship visits.' }];
  d.education = [{ id: makeId(), institution: 'Local college', qualification: 'Level 2 Diploma in Care', yearCompleted: '2021' }];
  d.references = [
    { fullName: 'Jane Morgan', relationship: 'Line manager', company: s.employer, position: 'Registered Manager',
      email: 'jane.morgan@example.com', phone: '07700 900201', yearsKnown: '3' },
    { fullName: 'Peter Owen', relationship: 'Former supervisor', company: 'Previous employer', position: 'Team Leader',
      email: 'peter.owen@example.com', phone: '07700 900202', yearsKnown: '2' },
  ];
  d.declaration = { ...d.declaration, hasCriminalConvictions: 'no', hasHealthConditionAffectingWork: 'no',
    informationAccurate: true, consentToReferenceChecks: true, consentToDataProcessing: true,
    signatureFullName: `${s.first} ${s.last}`, signatureDate: at(s.daysAgo).slice(0, 10) };
  return d;
}

export function buildSeed(): { apps: ApplicationRecord[]; docs: Record<string, DemoDocument> } {
  const apps: ApplicationRecord[] = [];
  const docs: Record<string, DemoDocument> = {};
  SPECS.forEach((s, i) => {
    const ref = `DEMO-${(1001 + i).toString()}`;
    const payload = payloadFor(s, ref);
    const history: StageHistoryEntry[] = [
      { stage: 'right_to_work_check', at: at(s.daysAgo), by: 'system', note: 'Application submitted' },
      ...s.history.map(([stage, days, note]) => ({ stage, at: at(days, 14), by: 'Demo Staff', note })),
    ];
    apps.push({
      id: `demo-${i + 1}`,
      reference_id: ref,
      applicant_name: `${s.first} ${s.last}`,
      email: payload.contact.email1,
      phone: payload.contact.mobileTel1,
      stage: s.stage,
      rtw_status: s.rtw,
      dbs_status: s.dbs,
      created_at: at(s.daysAgo),
      payload,
      closed_reason: s.closedReason ?? null,
      stage_history: history,
    });
    const name = `${s.first} ${s.last}`;
    const slots: Array<[DocumentSlot, string, string[]]> = [
      ['rightToWorkEvidence', 'Right to work: share code check', [`Name: ${name}`, 'Result: Permission to work in the UK', 'Checked online via GOV.UK (sample)']],
      ['dbsCertificate', 'Enhanced DBS certificate', [`Name: ${name}`, 'Disclosure type: Enhanced with barred lists', 'Result: No information recorded (sample)']],
    ];
    for (const [slot, title, lines] of slots) {
      const doc = payload.documents[slot];
      if (doc) docs[doc.pathname] = { contentType: 'image/svg+xml', dataUrl: sampleDocSvg(title, lines) };
    }
  });
  return { apps, docs };
}
