/* ==========================================================
   Diploconnect11 - static data
   Change APP_NAME to rename the site everywhere.
   ========================================================== */
const APP_NAME = 'Diploconnect11';

/* SBTE Bihar affiliated polytechnic colleges.
   Only these can be chosen at sign-up, which keeps the network limited to SBTE colleges.
   Compiled from public listings; check against https://sbte.bihar.gov.in and add or
   remove colleges by editing this list. */
const SBTE_COLLEGES = [
  'Government Polytechnic, Araria',
  'Government Polytechnic, Arwal',
  'Government Polytechnic, Asthawan, Nalanda',
  'Government Polytechnic, Aurangabad',
  'Government Polytechnic, Banka',
  'Government Polytechnic, Barauni',
  'Government Polytechnic, Barh',
  'Government Polytechnic, Bhagalpur',
  'Government Polytechnic, Bhojpur',
  'Government Polytechnic, Buxar',
  'Government Polytechnic, Chapra',
  'Government Polytechnic, Darbhanga',
  'Government Polytechnic, Gaya',
  'Government Polytechnic, Gopalganj',
  'Government Polytechnic, Gulzarbagh, Patna',
  'Government Polytechnic, Jamui',
  'Government Polytechnic, Jehanabad',
  'Government Polytechnic, Kaimur',
  'Government Polytechnic, Katihar',
  'Government Polytechnic, Khagaria',
  'Government Polytechnic, Kishanganj',
  'Government Polytechnic, Madhepura',
  'Government Polytechnic, Madhubani',
  'Government Polytechnic, Motihari',
  'Government Polytechnic, Munger',
  'Government Polytechnic, Muzaffarpur',
  'Government Polytechnic, Nawada',
  'Government Polytechnic, Patna 7',
  'Government Polytechnic, Purnea',
  'Government Polytechnic, Raghopur, Supaul',
  'Government Polytechnic, Sheikhpura',
  'Government Polytechnic, Siwan',
  'Government Polytechnic, Sitamarhi',
  'Government Polytechnic, Tekari, Gaya',
  'Government Polytechnic, Vaishali',
  'Government Polytechnic, West Champaran',
  'Government Textile Technology Institute, Bhagalpur',
  'BKNS Government Polytechnic, Gopalganj',
  'KNS Government Polytechnic, Samastipur'
].sort();

const BRANCHES = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Electronics and Communication Engineering',
  'Computer Science and Engineering',
  'Information Technology',
  'Automobile Engineering',
  'Chemical Engineering',
  'Textile Technology',
  'Printing Technology',
  'Mining Engineering',
  'Other diploma branch'
];

const ROLES = ['Diploma student', 'Diploma holder', 'Engineer'];

const SKILL_SUGGESTIONS = [
  'AutoCAD', 'STAAD Pro', 'Revit', 'SolidWorks', 'CATIA', 'MATLAB', 'PLC Programming', 'SCADA',
  'Arduino', 'Embedded C', 'Python', 'Java', 'C++', 'HTML and CSS', 'JavaScript', 'MS Excel',
  'Surveying', 'Estimating and Costing', 'Electrical Wiring', 'CNC Machining', '3D Printing',
  'Computer Networking', 'IoT', 'Tally', 'Site Supervision', 'Quality Control', 'Communication'
];

/* Sample profiles so the network is not empty on first visit.
   They are fictional and only exist in the visitor's own browser. */
const SEED_USERS = [
  {
    id: 'u_priya', seed: true, name: 'Priya Kumari', email: 'priya.demo@example.com',
    role: 'Diploma student', college: 'Government Polytechnic, Muzaffarpur', branch: 'Electrical Engineering',
    headline: 'Diploma student in Electrical Engineering, learning PLC and SCADA',
    location: 'Muzaffarpur, Bihar',
    about: 'Final year student who likes industrial automation. I built a small conveyor sorting model with a PLC for my minor project and I am looking for a summer internship in a manufacturing plant.',
    skills: ['PLC Programming', 'SCADA', 'AutoCAD Electrical', 'Electrical Wiring'],
    education: [{ id: 'e1', school: 'Government Polytechnic, Muzaffarpur', degree: 'Diploma', field: 'Electrical Engineering', start: 2023, end: 2026 }],
    certs: [{ id: 'c1', name: 'PLC and SCADA Fundamentals', issuer: 'NSDC Skill India', year: 2025, url: '' }]
  },
  {
    id: 'u_aman', seed: true, name: 'Aman Kumar', email: 'aman.demo@example.com',
    role: 'Engineer', college: 'Government Polytechnic, Darbhanga', branch: 'Civil Engineering',
    headline: 'Site Engineer, B.Tech Civil (lateral entry) after SBTE diploma',
    location: 'Patna, Bihar',
    about: 'Diploma in Civil Engineering from Darbhanga, then B.Tech through lateral entry. I work on road and drainage projects and enjoy helping juniors prepare for site interviews.',
    skills: ['AutoCAD', 'Surveying', 'Estimating and Costing', 'Site Supervision', 'MS Excel'],
    education: [
      { id: 'e1', school: 'Government Polytechnic, Darbhanga', degree: 'Diploma', field: 'Civil Engineering', start: 2016, end: 2019 },
      { id: 'e2', school: 'BIT Sindri', degree: 'B.Tech (lateral entry)', field: 'Civil Engineering', start: 2019, end: 2022 }
    ],
    certs: [{ id: 'c1', name: 'STAAD Pro Structural Analysis', issuer: 'Bentley Systems', year: 2021, url: '' }]
  },
  {
    id: 'u_rahul', seed: true, name: 'Rahul Raj', email: 'rahul.demo@example.com',
    role: 'Diploma holder', college: 'Government Polytechnic, Bhagalpur', branch: 'Mechanical Engineering',
    headline: 'Diploma holder in Mechanical Engineering, CNC and CAD operator',
    location: 'Bhagalpur, Bihar',
    about: 'Passed out in 2024 and working as a CNC operator while preparing for lateral entry into B.Tech.',
    skills: ['CNC Machining', 'SolidWorks', 'AutoCAD', 'Quality Control'],
    education: [{ id: 'e1', school: 'Government Polytechnic, Bhagalpur', degree: 'Diploma', field: 'Mechanical Engineering', start: 2021, end: 2024 }],
    certs: [{ id: 'c1', name: 'CNC Programming', issuer: 'CIPET', year: 2024, url: '' }]
  },
  {
    id: 'u_neha', seed: true, name: 'Neha Singh', email: 'neha.demo@example.com',
    role: 'Diploma student', college: 'Government Polytechnic, Gaya', branch: 'Computer Science and Engineering',
    headline: 'Diploma student in Computer Science, building web projects',
    location: 'Gaya, Bihar',
    about: 'I build small web apps with HTML, CSS and JavaScript and I am learning Python. Happy to team up on hackathons.',
    skills: ['HTML and CSS', 'JavaScript', 'Python', 'Java'],
    education: [{ id: 'e1', school: 'Government Polytechnic, Gaya', degree: 'Diploma', field: 'Computer Science and Engineering', start: 2024, end: 2027 }],
    certs: [{ id: 'c1', name: 'Responsive Web Design', issuer: 'freeCodeCamp', year: 2025, url: '' }]
  },
  {
    id: 'u_sandeep', seed: true, name: 'Sandeep Yadav', email: 'sandeep.demo@example.com',
    role: 'Engineer', college: 'Government Polytechnic, Muzaffarpur', branch: 'Electrical Engineering',
    headline: 'Maintenance Engineer at a power distribution company',
    location: 'Ranchi, Jharkhand',
    about: 'Muzaffarpur polytechnic alumnus. I handle substation maintenance and can guide juniors on ITI and diploma campus placements.',
    skills: ['Electrical Wiring', 'SCADA', 'MS Excel', 'Communication'],
    education: [{ id: 'e1', school: 'Government Polytechnic, Muzaffarpur', degree: 'Diploma', field: 'Electrical Engineering', start: 2015, end: 2018 }],
    certs: []
  },
  {
    id: 'u_ritu', seed: true, name: 'Ritu Sharma', email: 'ritu.demo@example.com',
    role: 'Diploma student', college: 'Government Polytechnic, Patna 7', branch: 'Electronics and Communication Engineering',
    headline: 'Diploma student in Electronics, IoT and embedded systems',
    location: 'Patna, Bihar',
    about: 'Working on an IoT based soil moisture monitor with Arduino and a GSM module.',
    skills: ['Arduino', 'Embedded C', 'IoT', 'Python'],
    education: [{ id: 'e1', school: 'Government Polytechnic, Patna 7', degree: 'Diploma', field: 'Electronics and Communication Engineering', start: 2023, end: 2026 }],
    certs: [{ id: 'c1', name: 'Embedded Systems Basics', issuer: 'NPTEL', year: 2025, url: '' }]
  },
  {
    id: 'u_vikash', seed: true, name: 'Vikash Kumar', email: 'vikash.demo@example.com',
    role: 'Diploma holder', college: 'Government Polytechnic, Darbhanga', branch: 'Civil Engineering',
    headline: 'Diploma holder in Civil Engineering, site supervisor',
    location: 'Darbhanga, Bihar',
    about: 'Supervising building construction sites. Interested in learning Revit and quantity surveying.',
    skills: ['Site Supervision', 'Surveying', 'AutoCAD'],
    education: [{ id: 'e1', school: 'Government Polytechnic, Darbhanga', degree: 'Diploma', field: 'Civil Engineering', start: 2020, end: 2023 }],
    certs: []
  },
  {
    id: 'u_anjali', seed: true, name: 'Anjali Kumari', email: 'anjali.demo@example.com',
    role: 'Engineer', college: 'Government Polytechnic, Gopalganj', branch: 'Mechanical Engineering',
    headline: 'Design Engineer in an automotive parts company',
    location: 'Pune, Maharashtra',
    about: 'Started at Gopalganj polytechnic, now designing brackets and fixtures. Ask me about moving from diploma to a design role outside Bihar.',
    skills: ['SolidWorks', 'CATIA', 'AutoCAD', '3D Printing'],
    education: [
      { id: 'e1', school: 'Government Polytechnic, Gopalganj', degree: 'Diploma', field: 'Mechanical Engineering', start: 2017, end: 2020 },
      { id: 'e2', school: 'COEP Technological University', degree: 'B.Tech (lateral entry)', field: 'Mechanical Engineering', start: 2020, end: 2023 }
    ],
    certs: [{ id: 'c1', name: 'Certified SolidWorks Associate', issuer: 'Dassault Systemes', year: 2022, url: '' }]
  }
];

const SEED_POSTS = [
  { userId: 'u_anjali', h: 5, text: 'Tip for final year diploma students: put your minor and major projects on your profile with the tools you used. Recruiters scan for AutoCAD, SolidWorks and PLC keywords first.' },
  { userId: 'u_priya', h: 26, text: 'Our college electrical lab now has a working PLC trainer kit. Anyone from other polytechnics done a project on conveyor automation? Would love to compare notes.' },
  { userId: 'u_aman', h: 70, text: 'Lateral entry into B.Tech is a good path after diploma. Happy to answer questions about counselling, branch choice and how to prepare for the entrance.' }
];
