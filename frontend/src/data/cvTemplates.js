const baseHeader = (role = 'Professional') =>
    `# [Your Name] | ${role}\n[City], [Province], [Zip] | [Email] | [Phone]\n`;

export const cvTemplates = {
    "Blank Note": "",

    "Software & IT Services": `${baseHeader('Software Engineer')}
## Professional Summary
Dedicated software professional with expertise in developing scalable applications and solving complex technical challenges. Strong background in modern development practices and collaborative team environments.

## Technical Skills
- **Languages**: JavaScript, Python, Java, TypeScript
- **Frameworks**: React, Node.js, Django, Spring Boot
- **Tools**: Git, Docker, AWS, CI/CD pipelines
- **Databases**: PostgreSQL, MongoDB, Redis

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Developed and maintained critical software modules serving [X] users
- Improved system performance by [X]% through code optimization
- Collaborated with cross-functional teams to deliver features on schedule

## Education
- **[Degree]** | [University Name], [City] | [Year]

## Projects
- **[Project Name]**: Brief description of the project, tech stack, and your contribution
`,

    "Business & Finance": `${baseHeader('Finance Professional')}
## Professional Summary
Detail-oriented finance professional with a strong background in financial analysis, reporting, and strategic planning. Proven ability to drive data-informed business decisions.

## Core Competencies
- Financial Analysis & Modelling
- Budgeting & Forecasting
- Risk Assessment
- Regulatory Compliance
- ERP Systems (SAP, Oracle)

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Managed financial accounts and prepared quarterly reports for stakeholders
- Reduced operational costs by [X]% through process improvements
- Conducted variance analysis and provided actionable recommendations

## Education
- **[Degree in Finance/Accounting]** | [University Name], [City] | [Year]

## Certifications
- [CPA / CFA / ACCA — if applicable]
`,

    "Management & Executive": `${baseHeader('Senior Manager')}
## Professional Summary
Results-driven leader with extensive experience in strategic planning, team development, and operational excellence. Track record of delivering measurable business outcomes across diverse industries.

## Leadership Competencies
- Strategic Planning & Execution
- P&L Management
- Change Management
- Stakeholder Engagement
- Team Building & Mentoring

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Led a team of [X] professionals across [departments/regions]
- Drove revenue growth of [X]% through strategic initiatives
- Implemented operational improvements reducing costs by [X]%

## Education
- **[MBA / Degree]** | [University Name], [City] | [Year]
`,

    "HR & Recruitment": `${baseHeader('HR Professional')}
## Professional Summary
Strategic HR professional focused on talent acquisition, employee engagement, and building strong organizational culture. Experienced in full-cycle recruitment and HR operations.

## Core Competencies
- Talent Acquisition & Recruiting
- Employee Relations & Engagement
- Performance Management
- HR Policy Development
- HRIS Systems

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Managed end-to-end recruitment for [X]+ positions annually
- Reduced time-to-hire by [X]% through process optimization
- Developed and implemented employee engagement programs

## Education
- **[Degree in HR / Business]** | [University Name], [City] | [Year]
`,

    "Marketing & PR": `${baseHeader('Marketing Specialist')}
## Professional Summary
Creative and data-driven marketing professional with expertise in brand strategy, digital campaigns, and content creation. Skilled at translating business goals into compelling marketing initiatives.

## Skills
- Digital Marketing & SEO/SEM
- Content Strategy & Copywriting
- Social Media Management
- Brand Development
- Analytics (Google Analytics, Meta Ads)

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Launched campaigns that increased brand awareness by [X]%
- Managed marketing budget of $[X] with [X]% ROI
- Created content strategies across multiple channels

## Education
- **[Degree in Marketing/Communications]** | [University Name], [City] | [Year]
`,

    "Sales & Business Development": `${baseHeader('Sales Professional')}
## Professional Summary
Dynamic sales professional with a proven track record of exceeding targets and building lasting client relationships. Expert in consultative selling and pipeline management.

## Skills
- B2B / B2C Sales
- Client Relationship Management
- Negotiation & Closing
- CRM Tools (Salesforce, HubSpot)
- Market Research

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Exceeded sales targets by [X]% consistently over [X] quarters
- Built and managed a portfolio of [X]+ key accounts
- Developed new business opportunities worth $[X]

## Education
- **[Degree in Business/Marketing]** | [University Name], [City] | [Year]
`,

    "Engineering & Manufacturing": `${baseHeader('Engineer')}
## Professional Summary
Results-oriented engineer with expertise in design, manufacturing processes, and quality assurance. Committed to delivering innovative solutions that meet technical and business requirements.

## Core Competencies
- CAD Design (SolidWorks, AutoCAD)
- Process Optimization
- Quality Control & Testing
- Project Management
- Technical Documentation

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Designed and tested components for [product line/system]
- Reduced manufacturing costs by [X]% through design optimization
- Led cross-functional projects from concept to production

## Education
- **[B.S./M.S. Engineering]** | [University Name], [City] | [Year]
`,

    "Healthcare & Medical": `${baseHeader('Healthcare Professional')}
## Professional Summary
Compassionate healthcare professional dedicated to patient care and clinical excellence. Experienced in [specialty/area] with strong knowledge of medical protocols and patient safety standards.

## Skills
- Patient Assessment & Care
- Clinical Documentation
- Medical Equipment Operation
- HIPAA Compliance
- Team Collaboration

## Experience
### [Job Title] | [Hospital/Clinic Name]
*[Start Date] - [End Date]*
- Provided quality care to [X]+ patients daily
- Maintained accurate clinical records and documentation
- Collaborated with multidisciplinary healthcare teams

## Education
- **[Degree/Certification]** | [Institution Name], [City] | [Year]

## Certifications
- [Relevant medical license or certification]
`,

    "Education & Training": `${baseHeader('Educator')}
## Professional Summary
Passionate educator committed to fostering student growth and creating engaging learning environments. Experienced in curriculum development and differentiated instruction.

## Skills
- Curriculum Design & Lesson Planning
- Classroom Management
- Student Assessment
- Educational Technology
- Parent & Stakeholder Communication

## Experience
### [Job Title] | [School/Institution Name]
*[Start Date] - [End Date]*
- Taught [subject/grade level] to classes of [X] students
- Developed curriculum materials aligned with learning standards
- Improved student outcomes by [X]% through innovative teaching methods

## Education
- **[Degree in Education/Subject Area]** | [University Name], [City] | [Year]
`,

    "Retail & Customer Service": `${baseHeader('Customer Service Professional')}
## Professional Summary
Customer-focused professional with strong communication skills and a commitment to delivering exceptional service. Experienced in handling diverse customer needs in fast-paced environments.

## Skills
- Customer Relationship Management
- Conflict Resolution
- Point-of-Sale Systems
- Product Knowledge
- Team Leadership

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Maintained customer satisfaction rating of [X]%
- Handled [X]+ customer interactions daily
- Trained new team members on service standards and procedures

## Education
- **[Degree/Diploma]** | [Institution Name], [City] | [Year]
`,

    "Creative & Design": `${baseHeader('Creative Designer')}
## Professional Summary
Creative professional with a keen eye for visual design and brand identity. Skilled in translating concepts into compelling visual experiences across digital and print media.

## Skills
- Graphic Design (Adobe Creative Suite, Figma)
- UI/UX Design
- Brand Identity & Visual Communication
- Photography & Video Editing
- Typography & Layout

## Experience
### [Job Title] | [Company/Agency Name]
*[Start Date] - [End Date]*
- Designed [X]+ marketing materials and brand assets
- Led creative direction for [project/campaign name]
- Collaborated with clients to deliver designs aligned with brand vision

## Education
- **[Degree in Design/Visual Arts]** | [University Name], [City] | [Year]

## Portfolio
- [Portfolio URL or project highlights]
`,

    "Logistics & Supply Chain": `${baseHeader('Logistics Professional')}
## Professional Summary
Organized logistics professional with expertise in supply chain management, inventory control, and distribution operations. Focused on efficiency, cost reduction, and on-time delivery.

## Skills
- Inventory Management
- Warehouse Operations
- Transportation & Distribution
- ERP/WMS Systems
- Vendor Management

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Managed inventory worth $[X] with [X]% accuracy
- Optimized delivery routes reducing costs by [X]%
- Coordinated with suppliers and carriers for timely shipments

## Education
- **[Degree in Supply Chain/Logistics/Business]** | [University Name], [City] | [Year]
`,

    "Legal & Compliance": `${baseHeader('Legal Professional')}
## Professional Summary
Detail-oriented legal professional with expertise in [area of law/compliance]. Strong analytical skills and experience in research, documentation, and regulatory compliance.

## Skills
- Legal Research & Writing
- Contract Review & Drafting
- Regulatory Compliance
- Case Management
- Client Communication

## Experience
### [Job Title] | [Law Firm/Organization Name]
*[Start Date] - [End Date]*
- Conducted legal research and prepared case briefs
- Drafted and reviewed contracts and legal documents
- Ensured compliance with [relevant regulations/standards]

## Education
- **[Law Degree / LLB / JD]** | [University Name], [City] | [Year]

## Certifications
- [Bar admission / compliance certification — if applicable]
`,

    "Government & Public Sector": `${baseHeader('Public Sector Professional')}
## Professional Summary
Dedicated public sector professional with experience in policy implementation, community programs, and administrative operations. Committed to serving the public interest with integrity and efficiency.

## Skills
- Policy Analysis & Implementation
- Public Administration
- Stakeholder Engagement
- Report Writing & Documentation
- Budget Management

## Experience
### [Job Title] | [Government Agency/Department]
*[Start Date] - [End Date]*
- Managed [program/project] serving [X]+ citizens
- Prepared reports and briefings for senior officials
- Coordinated inter-agency collaboration on [initiative]

## Education
- **[Degree in Public Administration/Political Science]** | [University Name], [City] | [Year]
`,

    "Other / Professional": `${baseHeader('Professional')}
## Professional Summary
Versatile professional with a strong work ethic and a commitment to delivering high-quality results. Adaptable team player with proven ability to learn quickly and contribute across diverse roles.

## Skills
- [Skill 1]
- [Skill 2]
- [Skill 3]
- [Skill 4]

## Experience
### [Job Title] | [Company Name]
*[Start Date] - [End Date]*
- Successfully managed daily operations and team goals
- Achieved [specific measurable outcome]
- Collaborated with colleagues to improve processes

## Education
- **[Degree Name]** | [University Name], [City] | [Year]
`,

    // Legacy keys kept for backward compatibility
    "Software Engineer": null,
    "Mechanical Engineer": null,
    "Project Manager": null,
    "Technician": null,
    "HR Manager": null,
};

// Resolve legacy aliases
cvTemplates["Software Engineer"] = cvTemplates["Software & IT Services"];
cvTemplates["Mechanical Engineer"] = cvTemplates["Engineering & Manufacturing"];
cvTemplates["Project Manager"] = cvTemplates["Management & Executive"];
cvTemplates["Technician"] = cvTemplates["Engineering & Manufacturing"];
cvTemplates["HR Manager"] = cvTemplates["HR & Recruitment"];
