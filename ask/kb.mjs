// Offline answer matcher. Every answer here is written from ask-data/profile.md facts.
// Used by the page when /api/ask is unavailable or rate limited, and by the tests.
const RESUME = '/assets/Anilkumar_Kapala_Resume.pdf';
const P = (t) => ({ t, b: false });
const B = (t) => ({ t, b: true });
const MAIL = { href: 'mailto:bornfreeani@gmail.com', label: 'bornfreeani@gmail.com', dl: false };
const IN = { href: 'https://linkedin.com/in/anilkumarkapala', label: 'linkedin.com/in/anilkumarkapala', dl: false };
const CV = { href: RESUME, label: 'Download resume (PDF)', dl: true };

export const KB = [
{ id: 'greet', k: [['hi', 6], ['hello', 6], ['hey', 6], ['good morning', 6], ['good evening', 6]],
  a: () => ({ lines: [P("Hi, I'm Anil's AI. I answer questions about his work, skills and experience, using only his resume and technical profile."), P('Pick a question below or type your own.')] }),
  n: ['Who are you?', 'What can you do?', 'What have you done with Angular?'] },
{ id: 'about', k: [['who are you', 11], ['who is anil', 11], ['who is anilkumar', 11], ['about you', 8], ['about yourself', 9], ['introduce*', 8], ['yourself', 6], ['your name', 9], ['tell me about anil', 10], ['background', 4], ['summary', 5], ['profile', 3]],
  a: () => ({ lines: [P("I'm Anilkumar Kapala, a full stack developer based in Bengaluru, India, with 13+ years of experience."), P("I'm a Senior Engineer at FICO (Fair Isaac India) since 10/2024. Before that I was a Senior Technical Lead at Perfios."), P('My core is Angular, TypeScript, NgRx, RxJS, Nx and Micro Frontends on the front end, with Node.js on the back end, shipped through CI/CD.')] }),
  n: ['What can you do?', 'Show my career timeline', 'How can I contact you?'] },
{ id: 'cando', k: [['what can you do', 11], ['what you can do', 11], ['you can do', 8], ['what do you do', 10], ['can you do', 7], ['capabilit*', 8], ['skills', 8], ['skill', 6], ['expertise', 8], ['good at', 7], ['strengths', 7], ['specializ*', 7], ['specialis*', 7], ['what you know', 6], ['offer', 4]],
  a: () => ({ lines: [P('I build web applications end to end and ship them.'), B('Front end: Angular, TypeScript, JavaScript, NgRx, RxJS, SCSS, HTML5, CSS3'), B('Architecture: Micro Frontends with Nx Monorepo and Module Federation'), B('Back end: Node.js, REST APIs, MongoDB'), B('Quality: Jest, Playwright, Cypress'), B('Delivery: Webpack, NPM, Git, CI/CD, Docker, Helm, Kubernetes'), B('Leadership: sprint planning, task distribution and code reviews')] }),
  n: ['What impact have you had?', 'What have you done with Angular?', 'Tell me about micro frontends'] },
{ id: 'stack', k: [['tech stack', 11], ['stack', 8], ['technologies', 8], ['technology', 6], ['tools', 6], ['frameworks', 7], ['programming languages', 9], ['languages', 2]],
  a: () => ({ lines: [B('Core: Angular, TypeScript, JavaScript, NgRx, RxJS, Nx Monorepo, Micro Frontends, Module Federation'), B('Supporting: Node.js, React, REST APIs, MongoDB, SCSS, Jest, Playwright, Cypress, Webpack, NPM, Git, CI/CD, Docker, Helm, Kubernetes'), B('Earlier: Ruby on Rails, PHP, jQuery, Cordova, PhoneGap, MySQL, SQLite')] }),
  n: ['What have you done with Angular?', 'Do you work with Node.js?', 'How do you test your code?'] },
{ id: 'fullstack', k: [['full stack', 11], ['fullstack', 11]],
  a: () => ({ lines: [P('Yes. I work across the stack.'), B('Front end: Angular, TypeScript, NgRx, RxJS at FICO and in earlier roles'), B('Back end: Node.js at Perfios, EKA and NTT DATA, plus MongoDB data-processing scripts at EKA'), B('Earlier back end: Ruby on Rails at Bitla Software'), B('Delivery: CI/CD with GitLab at Perfios and Jenkins at EKA')] }),
  n: ['Do you work with Node.js?', 'Tell me about CI/CD', 'Show my career timeline'] },
{ id: 'angular', k: [['angular*', 10], ['signals', 4], ['angular 21', 11]],
  a: (q) => ({ lines: [].concat(/angular\s?js|angular\s?1/i.test(q) ? [P('My resume lists modern Angular (version 14 and up, currently 19), not AngularJS 1.x. Here is my Angular work.')] : [P("Angular is the framework I've used most, at FICO, Perfios, EKA, Digital Harbor and NTT DATA.")], [
    B('FICO: Angular 19. Micro Frontends with Nx and Module Federation, and Feature Management for enterprise financial technology applications. About 30% faster applications, about 25% less development effort.'),
    B('Perfios: Angular 14+ on the Digital Lending Platform and Business Rule Engine workflows.'),
    B('EKA: responsive Angular modules and reusable UI components for commodity trading and supply chain applications.'),
    B('Digital Harbor: Angular applications for a Healthcare Risk Management platform, plus reusable Angular NPM packages (about 30% less development effort).'),
    B('NTT DATA: Angular and reusable components built with designers for enterprise client projects.'),
    B('Now: learning Modern Angular 21 with Signals.')]) }),
  n: ['Do you use NgRx and RxJS?', 'Tell me about micro frontends', 'Tell me about FICO'] },
{ id: 'ngrx', k: [['ngrx', 11], ['rxjs', 11], ['rx js', 11], ['redux', 5], ['state management', 9], ['observables', 7], ['observable', 7], ['reactive', 5], ['switchmap', 9]],
  a: () => ({ lines: [P('NgRx and RxJS are part of my core stack, used with Angular 19 at FICO.'), P('I use RxJS for debouncing input and cancelling stale requests with switchMap, and NgRx effects to keep side effects predictable.')] }),
  n: ['What have you done with Angular?', 'Tell me about micro frontends', 'What is your tech stack?'] },
{ id: 'mfe', k: [['micro frontend*', 12], ['microfrontend*', 12], ['micro front end*', 12], ['module federation', 12], ['nx', 8], ['monorepo', 9], ['feature management', 10], ['architecture', 6], ['architect*', 6]],
  a: () => ({ lines: [P('At FICO I design and build Micro Frontends with Nx Monorepo and Module Federation, deployed independently.'), P('I also develop Feature Management capabilities for enterprise financial technology applications.'), P('The shared libraries and reusable components cut development effort by about 25%.')] }),
  n: ['What impact have you had?', 'Tell me about FICO', 'Do you use NgRx and RxJS?'] },
{ id: 'react', k: [['react*', 11]],
  a: () => ({ lines: [P('React is in my supporting stack, not my core.'), B('Perfios: React for internal tools'), B('NTT DATA: React on client projects'), B('EKA: one small React project')] }),
  n: ['What is your tech stack?', 'What have you done with Angular?', 'Do you work with Node.js?'] },
{ id: 'node', k: [['node', 9], ['node.js', 12], ['nodejs', 12], ['node js', 12], ['backend', 8], ['back end', 8], ['server side', 6], ['mongodb', 10], ['mongo', 9], ['rest api*', 9], ['rest', 4], ['api', 3], ['apis', 3]],
  a: () => ({ lines: [P('Yes. Node.js is my main back-end tool.'), B('Perfios: Node.js with REST, and secured integrations with encrypted request and response payloads'), B('EKA: Node.js and MongoDB, including JavaScript data-processing scripts for collection and document updates'), B('NTT DATA: Node.js on enterprise client projects')] }),
  n: ['Tell me about CI/CD', 'Tell me about Perfios', 'What is your tech stack?'] },
{ id: 'testing', k: [['test*', 9], ['jest', 11], ['playwright', 11], ['cypress', 11], ['quality', 5], ['unit test*', 11], ['e2e', 9]],
  a: () => ({ lines: [P('My testing tools are Jest, Playwright and Cypress.'), P('Jest is listed on my FICO work. Playwright and Cypress are part of my supporting stack for end-to-end testing.')] }),
  n: ['Tell me about CI/CD', 'What is your tech stack?', 'Tell me about FICO'] },
{ id: 'cicd', k: [['ci cd', 12], ['cicd', 12], ['pipeline*', 9], ['jenkins', 11], ['gitlab', 11], ['docker', 11], ['kubernetes', 11], ['k8s', 11], ['helm', 11], ['devops', 9], ['deploy*', 8], ['deployment*', 8], ['git', 4]],
  a: () => ({ lines: [P('I ship through CI/CD.'), B('Perfios: GitLab CI/CD pipelines that cut manual deployment effort'), B('EKA: Jenkins pipelines that reduced manual deployment effort and errors'), B('FICO: Micro Frontends deployed independently, with Docker, Helm and Kubernetes in my stack')] }),
  n: ['Tell me about Perfios', 'Tell me about micro frontends', 'How do you test your code?'] },
{ id: 'hackathon', k: [['hackathon', 12], ['aws', 9], ['award*', 9], ['prize', 9], ['won', 5], ['recognition', 7]],
  a: () => ({ lines: [P('I was a Grand Prize Winner of the AWS Cost Optimization Hackathon at FICO.')] }),
  n: ['Tell me about FICO', 'What impact have you had?', 'Show my career timeline'] },
{ id: 'impact', k: [['impact', 10], ['metrics', 9], ['results', 7], ['performance', 10], ['optimi*', 8], ['lazy loading', 11], ['code splitting', 11], ['percent', 6], ['accomplish*', 8], ['achievements', 8], ['highlights', 9], ['what have you done', 9], ['what have you built', 9], ['what did you build', 9], ['proud', 5], ['faster', 6]],
  a: () => ({ lines: [P('The numbers I can stand behind:'), B('FICO: about 30% faster applications through lazy loading, code splitting and efficient rendering'), B('FICO: about 25% less development effort with reusable components and shared libraries'), B('FICO: Grand Prize Winner, AWS Cost Optimization Hackathon'), B('Digital Harbor: about 30% less development effort with reusable Angular NPM packages'), B('Gladminds: about 20% higher field-user productivity through offline functionality')] }),
  n: ['What have you done with Angular?', 'Tell me about micro frontends', 'Show my career timeline'] },
{ id: 'lead', k: [['led', 7], ['lead*', 8], ['team', 6], ['mentor*', 8], ['manage*', 6], ['code review*', 10], ['sprint*', 10], ['technical lead', 12], ['leadership', 11]],
  a: () => ({ lines: [P('As Senior Technical Lead at Perfios (08/2022 to 10/2024) I led frontend and technical delivery on the Digital Lending Platform.'), P('That included sprint planning, task distribution and code reviews.')] }),
  n: ['Tell me about Perfios', 'What impact have you had?', 'How can I contact you?'] },
{ id: 'fico', k: [['fico', 13], ['fair isaac', 13], ['current role', 10], ['current job', 10], ['current company', 10], ['currently', 6], ['where do you work', 11], ['working now', 8], ['present', 3]],
  a: () => ({ lines: [P('Senior Engineer at FICO (Fair Isaac India), 10/2024 to present.'), B('Angular 19, TypeScript, NgRx, RxJS, Nx, Module Federation, Jest, Helm, Kubernetes'), B('Design and build Micro Frontends deployed independently'), B('Develop Feature Management capabilities for enterprise financial technology applications'), B('About 30% faster applications and about 25% less development effort'), B('Grand Prize Winner, AWS Cost Optimization Hackathon')] }),
  n: ['Tell me about micro frontends', 'Tell me about Perfios', 'Show my career timeline'] },
{ id: 'perfios', k: [['perfios', 13], ['digital lending', 11], ['lending', 8], ['business rule engine', 11], ['rule engine', 10]],
  a: () => ({ lines: [P('Senior Technical Lead at Perfios, 08/2022 to 10/2024.'), B('Angular 14+, Node.js, React for internal tools, REST, GitLab CI/CD'), B('Contributed to the Digital Lending Platform and led frontend and technical delivery'), B('Built Business Rule Engine workflows for customer profiles, eligibility and lending decisions'), B('Secured integrations with encrypted request and response payloads'), B('Cut manual deployment effort with GitLab CI/CD pipelines')] }),
  n: ['Have you led teams?', 'Tell me about EKA', 'Tell me about CI/CD'] },
{ id: 'eka', k: [['eka', 13], ['commodity', 9], ['supply chain', 9], ['trading', 6]],
  a: () => ({ lines: [P('Senior Software Engineer at EKA Software Solutions, 04/2021 to 08/2022.'), B('Angular, Node.js, MongoDB, JavaScript, SCSS, Jenkins, one small React project'), B('Developed responsive Angular modules and reusable UI components for commodity trading and supply chain applications'), B('Wrote JavaScript data-processing scripts for MongoDB collection and document updates'), B('Created Jenkins pipelines that reduced manual deployment effort and errors')] }),
  n: ['Tell me about Digital Harbor', 'Do you work with Node.js?', 'Show my career timeline'] },
{ id: 'dh', k: [['digital harbor', 13], ['digital harbour', 13], ['healthcare', 9], ['health care', 9], ['risk management', 9], ['nexus', 9], ['npm', 6], ['npm packages', 10]],
  a: () => ({ lines: [P('Senior Software Engineer at Digital Harbor, 12/2018 to 03/2021.'), B('Angular, Webpack, NPM, Nexus, HTML5, CSS3'), B('Built Angular applications for a Healthcare Risk Management platform'), B('Published and versioned reusable Angular NPM packages and shared user profile modules through Nexus'), B('About 30% less development effort with the reusable component libraries')] }),
  n: ['Tell me about NTT DATA', 'What impact have you had?', 'Show my career timeline'] },
{ id: 'ntt', k: [['ntt', 13], ['ntt data', 13], ['honeywell', 12], ['tiaa', 12], ['kimberly', 12], ['xfactor', 12], ['sky network', 12], ['consultant', 8], ['wcag', 10], ['accessib*', 10], ['salesforce', 10], ['psd', 10], ['clients', 8]],
  a: () => ({ lines: [P('Senior Consultant, UI Consultant at NTT DATA, 07/2015 to 12/2018.'), B('Angular, React, Node.js, HTML5, CSS3, WCAG, Salesforce UI components'), B('Delivered enterprise UI for Honeywell, TIAA-CREF, Kimberly-Clark, Sky Network and XFactor'), B('Built responsive, accessible interfaces to WCAG requirements and converted PSD designs to pixel-perfect pages'), B('Created reusable Angular and Salesforce UI components with designers')] }),
  n: ['Tell me about Gladminds', 'What have you done with Angular?', 'Show my career timeline'] },
{ id: 'glad', k: [['gladminds', 13], ['aftersell', 12], ['afterbuy', 12], ['offline', 8], ['phonegap', 10], ['cordova', 10], ['jquery', 6], ['mobile', 4]],
  a: () => ({ lines: [P('Software Engineer at Gladminds, 03/2015 to 07/2015.'), B('jQuery, PhoneGap, Cordova, PHP, SQLite'), B('Built the AfterBuy and AfterSell service applications'), B('Added offline functionality that improved field-user productivity by about 20%')] }),
  n: ['Tell me about Bitla', 'Tell me about NTT DATA', 'Show my career timeline'] },
{ id: 'bitla', k: [['bitla', 13], ['rails', 11], ['ruby', 11], ['saas', 8], ['hospitality', 9], ['transport', 8], ['first job', 9]],
  a: () => ({ lines: [P('Software Engineer at Bitla Software, 10/2012 to 02/2015, my first role.'), B('Ruby on Rails and JavaScript'), B('Built responsive SaaS web applications for the transport and hospitality domains'), P("I haven't added product-level detail for this role to my profile yet.")] }),
  n: ['Tell me about Gladminds', 'Show my career timeline', 'What is your tech stack?'] },
{ id: 'years', k: [['how many years', 13], ['years of experience', 13], ['how long', 8], ['years', 6], ['experienced', 5], ['seniority', 6], ['senior', 4]],
  a: () => ({ lines: [P('13+ years, starting 10/2012 at Bitla Software and now Senior Engineer at FICO.')] }),
  n: ['Show my career timeline', 'What can you do?', 'What impact have you had?'] },
{ id: 'career', k: [['career', 11], ['timeline', 12], ['experience', 8], ['work history', 12], ['history', 6], ['roles', 8], ['companies', 9], ['employers', 9], ['worked', 6], ['jobs', 8], ['where have you worked', 12]],
  a: () => ({ lines: [P('Newest first:'), B('10/2024 to present: Senior Engineer, FICO (Fair Isaac India)'), B('08/2022 to 10/2024: Senior Technical Lead, Perfios'), B('04/2021 to 08/2022: Senior Software Engineer, EKA Software Solutions'), B('12/2018 to 03/2021: Senior Software Engineer, Digital Harbor'), B('07/2015 to 12/2018: Senior Consultant, UI Consultant, NTT DATA'), B('03/2015 to 07/2015: Software Engineer, Gladminds'), B('10/2012 to 02/2015: Software Engineer, Bitla Software')] }),
  n: ['Tell me about FICO', 'What impact have you had?', 'Download your resume'] },
{ id: 'resume', k: [['resume', 11], ['cv', 11], ['download', 10], ['pdf', 9]],
  a: () => ({ lines: [P('Here is my resume as a PDF.')], links: [CV] }),
  n: ['How can I contact you?', 'Show my career timeline', 'What can you do?'] },
{ id: 'edu', k: [['education', 12], ['degree', 12], ['b tech', 12], ['btech', 12], ['college', 9], ['university', 9], ['studied', 10], ['study', 8], ['graduat*', 9], ['jntu', 12], ['qualification*', 9], ['prajna', 12]],
  a: () => ({ lines: [P('B.Tech in Computer Science from Prajna Institute of Technology & Management, JNTU Kakinada, 2008 to 2012.')] }),
  n: ['What are you learning now?', 'Show my career timeline', 'What can you do?'] },
{ id: 'learning', k: [['learning', 11], ['learn', 8], ['course', 9], ['udemy', 12], ['upskill*', 9], ['studying', 6]],
  a: () => ({ lines: [P("I'm taking Modern Angular 21 with Signals on Udemy, in progress since 03/2026.")] }),
  n: ['What have you done with Angular?', 'Where did you study?', 'What can you do?'] },
{ id: 'spoken', k: [['telugu', 12], ['english', 9], ['speak', 8], ['spoken', 9], ['language', 4], ['languages', 3]],
  a: () => ({ lines: [P('English (fluent) and Telugu (native).')] }),
  n: ['Where are you based?', 'How can I contact you?', 'What can you do?'] },
{ id: 'location', k: [['where are you', 11], ['based', 8], ['location', 11], ['located', 9], ['city', 5], ['bengaluru', 12], ['bangalore', 12], ['india', 3], ['live', 3]],
  a: () => ({ lines: [P("I'm based in Bengaluru, India.")] }),
  n: ['How can I contact you?', 'Show my career timeline', 'Who are you?'] },
{ id: 'unknown', k: [['salary', 13], ['ctc', 13], ['compensation', 13], ['expected', 6], ['notice period', 13], ['notice', 6], ['relocat*', 13], ['remote', 10], ['visa', 13], ['age', 8], ['old are you', 13], ['married', 13], ['family', 10], ['available', 8], ['availability', 11], ['hobbies', 11], ['interests', 8]],
  a: () => ({ lines: [P("That isn't in my profile, so I won't guess."), P('For anything beyond my work and skills, please reach out directly.')], links: [MAIL, IN] }),
  n: ['How can I contact you?', 'Show my career timeline', 'What can you do?'] },
{ id: 'contact', k: [['contact*', 11], ['email', 12], ['mail', 9], ['linkedin', 12], ['reach', 9], ['hire', 11], ['hiring', 11], ['get in touch', 12], ['connect', 8], ['talk to', 7], ['phone', 6], ['message', 5], ['interview', 8], ['opportunit*', 8]],
  a: () => ({ lines: [P('The best ways to reach me:')], links: [MAIL, IN] }),
  n: ['Download your resume', 'Show my career timeline', 'What can you do?'] }
];

export const FALLBACK = { lines: [P("I can only answer questions about Anil's work, skills and experience, from his resume and technical profile. I don't browse the web or answer general questions."), P('Try asking about his roles, Angular work, tech stack or results.')], n: ['What can you do?', 'What have you done with Angular?', 'Show my career timeline'] };

function norm(s) { return ' ' + String(s).toLowerCase().replace(/\.(?!\w)/g, ' ').replace(/[^a-z0-9+#.\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
function hit(n, p) { return p.charAt(p.length - 1) === '*' ? n.indexOf(' ' + p.slice(0, -1)) >= 0 : n.indexOf(' ' + p + ' ') >= 0; }
export function answer(q) {
  const n = norm(q);
  let best = null, top = 0;
  for (const e of KB) {
    let s = 0;
    for (const [p, w] of e.k) if (hit(n, p)) s += w;
    if (s > top) { top = s; best = e; }
  }
  if (!best || top < 5) return FALLBACK;
  if (top < 12 && /president|weather|news|capital|stock|recipe|movie|joke|translate|write (me )?(a|an|some)|generate|who (is|was) (the|a)|how to/.test(n)) return FALLBACK;
  const a = best.a(q);
  return { lines: a.lines, links: a.links || [], n: best.n };
}

export const START = ['Who are you?', 'What can you do?', 'What have you done with Angular?', 'Tell me about FICO', 'Show my career timeline', 'How can I contact you?'];
export const MAIL_LINK = MAIL;
export const IN_LINK = IN;
export const CV_LINK = CV;
