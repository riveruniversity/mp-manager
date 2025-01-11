
export const dbUser = encodeURIComponent(process.env.MONGO_DB_USER || '');
export const dbPass = encodeURIComponent(process.env.MONGO_DB_PASS || '');
export const dbApp = encodeURIComponent(process.env.DB_URL_APP || '');
export const dbUrl = (process.env.DB_URL || '') + dbApp;
export const eventbriteToken = (process.env.EVENTBRITE_TOKEN || '');


export const events = {
  carShow: 69871,
  youthWeek: 69538,
  fireConf: 69201,
  thatsIt: 69349,
  mensConf: 68412,
  womansConf: 69537,
  turkeyFest: 69603,
  christmas: 69604,
  christmasChild: 69617,
  mlcShout: 69536,
  easterFest: 69855
};



export const group = {
  member: 504,
  staff: 490,
  contractor: 491,
  intern: 363,
  waiver: 500,
  waiver2023: 530,
  trespassed: 527
};

export const youthWeek = {
  groupRegistrations: 542,
  kids: 545,
  youth: 546,
  adult: 547,
  545: 'kids',
  546: 'youth',
  547: 'adult'
};

