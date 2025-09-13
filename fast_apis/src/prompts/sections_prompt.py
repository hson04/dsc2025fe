ACHIEVEMENTS = """You are going to write a JSON resume section of "Achievements" for an applicant applying for job posts.

Step to follow:
1. Analyze the provided data from projects, work experiences, and existing achievements to identify AWARDS and RECOGNITIONS that match job requirements.
2. Extract and synthesize achievements from all three sources (projects, work_experience, achievements).
3. Create a JSON resume section that highlights strongest achievement matches.
4. Optimize JSON section for clarity and relevance to the job description.

Instructions:
1. Focus: Craft relevant achievements aligned with the job description, using **only** the data provided in `section_data` which contains:
   - `projects`: Array of project data that may contain achievements
   - `work_experience`: Array of work experience data that may contain achievements  
   - `achievements`: Array of existing achievements
2. Extraction Strategy - **AWARDS/RECOGNITIONS ONLY**: Look for achievements in:
   - **Awards & Prizes**: Competition wins, hackathon prizes, contest rankings, academic honors
   - **Recognitions**: Certificates of achievement, dean's list, honors programs, scholarships
   - **Publications**: Research papers, articles, patents, publications
   - **Professional Recognition**: Employee of the month, performance awards, leadership recognitions
   - **Academic Achievements**: Graduation honors (magna cum laude, summa cum laude), academic awards
   
3. **EXCLUDE Performance Metrics**: Do NOT include:
   - Accuracy percentages (e.g., "Achieved 80% accuracy")
   - Performance improvements (e.g., "Improved user engagement by 10%")
   - Technical accomplishments without formal recognition
   - General project outcomes or results
   
4. Honesty: Prioritize truthfulness and objective language. Do not create, infer, or add new achievements not explicitly stated in the provided data.
5. Specificity: Prioritize relevance to the specific job over general achievements, but only include achievements extractable from `section_data`.
6. Style:
   6.1. Voice: Use active voice whenever possible.
   6.2. Recognition Focus: Emphasize formal recognition, awards, and honors.
   6.3. Proofreading: Ensure impeccable spelling and grammar.
7. Strict Constraint: Do not invent, infer, or fabricate any achievements, dates, metrics, or other details not explicitly present in `section_data`. If no formal awards/recognitions can be extracted, return an empty array `[]`.
8. JSON Format: Return ONLY a valid JSON object with "achievements" key containing an array of strings.

<combined_data>
{section_data}
</combined_data>

<job_description>
{job_description}
</job_description>

<valid_achievement_examples>
✅ INCLUDE (Awards/Recognitions):
- "Won first prize in UIT Data Science Challenge 2025"
- "Dean's List 2023"
- "Published research paper in IEEE on machine learning applications"
- "Received 'Employee of the Month' award for outstanding performance"
- "Graduated Magna Cum Laude"
- "AWS Certified Solutions Architect"
- "Patent holder for AI-based recommendation system"

❌ EXCLUDE (Performance Metrics):
- "Achieved 80% accuracy in image classification model"
- "Improved user engagement by 10%"
- "Reduced system downtime by 65%"
- "Optimized performance by 40%"
- "Increased efficiency by 25%"
</valid_achievement_examples>

<example_output>
{{
  "achievements": [
    "Won first prize in UIT Data Science Challenge 2025",
    "Dean's List 2023",
    "Published research paper in IEEE on machine learning applications",
    "AWS Certified Cloud Practitioner"
  ]
}}
</example_output>

IMPORTANT: Your response must be a valid JSON object starting with {{ and ending with }}. Do not include any text before or after the JSON. Focus ONLY on formal awards, recognitions, honors, and prizes.

{format_instructions}
"""
CERTIFICATIONS = """You are going to write a JSON resume section of "Certifications" for an applicant applying for job posts.

Step to follow:
1. Analyze my certification details to match job requirements.
2. Create a JSON resume section that highlights strongest matches.
3. Optimize JSON section for clarity and relevance to the job description.

Instructions:
1. Focus: Include relevant certifications aligned with the job description, using **only** the data provided in `section_data`.
2. Proofreading: Ensure impeccable spelling and grammar.
3. Strict Constraint: Do not create, infer, or add new certifications, issuers, dates, or links not explicitly listed in `section_data`. If `link` is not provided, set it to an empty string `""`. If no certifications are provided, return an empty array `[]`.

<CERTIFICATIONS>
{section_data}
</CERTIFICATIONS>

<job_description>
{job_description}
</job_description>

<example>
  "certifications": [
    {{
      "name": "Deep Learning Specialization",
      "by": "DeepLearning.AI, Coursera Inc.",
      "link": "https://www.coursera.org/account/accomplishments/specialization/G3WPNWRYX628"
    }},
    {{
      "name": "Server-side Backend Development",
      "by": "The Hong Kong University of Science and Technology.",
      "link": "https://www.coursera.org/account/accomplishments/verify/TYMQX23D4HRQ"
    }}
    ...
  ],
</example>

{format_instructions}
"""
EDUCATIONS = """You are going to write a JSON resume section of "Education" for an applicant applying for job posts.

Step to follow:
1. Analyze my education details to match job requirements.
2. Create a JSON resume section that highlights strongest matches.
3. Optimize JSON section for clarity and relevance to the job description.

Instructions:
- Maintain truthfulness and objectivity in listing education details, using **only** the data provided in `section_data`.
- Prioritize specificity - with respect to job - over generality, but only include education entries from `section_data`.
- Proofread and correct spelling and grammar errors.
- Aim for clear expression over impressiveness.
- Prefer active voice over passive voice.
- Strict Constraint: Do not create, infer, or add new education entries, institutions, degrees, dates, grades, or coursework not explicitly listed in `section_data`. If no education data is provided, return an empty array `[]`.

<Education>
{section_data}
</Education>

<job_description>
{job_description}
</job_description>

<example>
"education": [
  {{
    "degree": "Masters of Science - Computer Science (Thesis)",
    "university": "Arizona State University, Tempe, USA",
    "from_date": "Aug 2023",
    "to_date": "May 2025",
    "grade": "3.8/4",
    "coursework": [
      "Operational Deep Learning",
      "Software verification, Validation and Testing",
      "Social Media Mining",
      [and So on ...]
    ]
  }}
  [and So on ...]
],
</example>

{format_instructions}
"""

PROJECTS="""You are going to write a JSON resume section of "Project Experience" for an applicant applying for job posts.

Step to follow:
1. Analyze my project details to match job requirements.
2. Create a JSON resume section that highlights strongest matches.
3. Optimize JSON section for clarity and relevance to the job description.

Instructions:
1. Focus: Include project experiences aligned with the job description, using **only** the data provided in `section_data`.
2. Content:
  2.1. Bullet points: Include up to 3 bullet points per experience from `section_data`, closely mirroring job requirements.
  2.2. Impact: Quantify each bullet point for measurable results, but only use quantifiable data provided in `section_data`.
  2.3. Storytelling: Utilize STAR methodology (Situation, Task, Action, Result) implicitly within each bullet point, rephrasing descriptions from `section_data` if needed, but do not add new content.
  2.4. Action Verbs: Showcase soft skills with strong, active verbs.
  2.5. Honesty: Prioritize truthfulness and objective language. Do not create, infer, or add new projects, descriptions, dates, links, or technologies not explicitly listed in `section_data`.
  2.6. Structure: Each bullet point follows "Did X by doing Y, achieved Z" format, using only data from `section_data`.
  2.7. Specificity: Prioritize relevance to the specific job, but only include projects and details from `section_data`.
3. Style:
  3.1. Clarity: Clear expression trumps impressiveness.
  3.2. Voice: Use active voice whenever possible.
  3.3. Proofreading: Ensure impeccable spelling and grammar.
4. Strict Constraint: Do not create, infer, or add new projects, URLs, dates, technologies, or other details not explicitly present in `section_data`. If no projects are provided, return an empty array `[]`.

<PROJECTS>
{section_data}
</PROJECTS>

<job_description>
{job_description}
</job_description>

<example>
"projects": [
    {{
      "name": "Search Engine for All file types - Sunhack Hackathon - Meta & Amazon Sponsored",
      "type": "Hackathon",
      "link": "https://devpost.com/software/team-soul-1fjgwo",
      "from_date": "Nov 2023",
      "to_date": "Nov 2023",
      "description": [
        "1st runner up prize in crafted AI persona, to explore LLM's subtle contextual understanding and create innovative collaborations between humans and machines.",
        "Devised a TabNet Classifier Model having 98.7% accuracy in detecting forest fire through IoT sensor data, deployed on AWS and edge devices 'Silvanet Wildfire Sensors' using technologies TinyML, Docker, Redis, and celery.",
        [and So on ...]
      ]
    }}
    [and So on ...]
  ]
  </example>
  
{format_instructions}
"""
SKILLS="""You are going to write a JSON resume section of "Skills" for an applicant applying for job posts.

Step to follow:
1. Analyze my skills details to match job requirements.
2. Create a JSON resume section that highlights strongest matches.
3. Optimize JSON section for clarity and relevance to the job description.

Instructions:
- Specificity: Prioritize relevance to the specific job, using **only** the skills provided in `section_data`.
- Proofreading: Ensure impeccable spelling and grammar.
- Strict Constraint: Do not create, infer, or add new skills or skill groups not explicitly listed in `section_data`. If no skills are provided, return an empty array `[]`.

<SKILL_SECTION>
{section_data}
</SKILL_SECTION>

<job_description>
{job_description}
</job_description>

<example>
"skill_section": [
    {{
      "name": "Programming Languages",
      "skills": ["Python", "JavaScript", "C#", and so on ...]
    }},
    {{
      "name": "Cloud and DevOps",
      "skills": [ "Azure", "AWS", and so on ... ]
    }},
    and so on ...
  ]
</example>
  
{format_instructions}
"""
EXPERIENCE="""You are going to write a JSON resume section of "Work Experience" for an applicant applying for job posts.

Step to follow:
1. Analyze my work details to match job requirements.
2. Create a JSON resume section that highlights strongest matches.
3. Optimize JSON section for clarity and relevance to the job description.

Instructions:
1. Focus: Include work experiences aligned with the job description, using **only** the data provided in `section_data`.
2. Content:
  2.1. Bullet points: Include up to 3 bullet points per experience from `section_data`, closely mirroring job requirements.
  2.2. Impact: Quantify each bullet point for measurable results, but only use quantifiable data provided in `section_data`.
  2.3. Storytelling: Utilize STAR methodology (Situation, Task, Action, Result) implicitly within each bullet point, rephrasing descriptions from `section_data` if needed, but do not add new content.
  2.4. Action Verbs: Showcase soft skills with strong, active verbs.
  2.5. Honesty: Prioritize truthfulness and objective language. Do not create, infer, or add new work experiences, roles, companies, dates, locations not explicitly listed in `section_data`.
  2.6. Structure: Each bullet point follows "Did X by doing Y, achieved Z" format, using only data from `section_data`.
  2.7. Specificity: Prioritize relevance to the specific job, but only include experiences and details from `section_data`.
3. Style:
  3.1. Clarity: Clear expression trumps impressiveness.
  3.2. Voice: Use active voice whenever possible.
  3.3. Proofreading: Ensure impeccable spelling and grammar.
4. Strict Constraint: Do not create, infer, or add new work experiences, dates, locations not explicitly present in `section_data`. If no work experiences are provided, return an empty array `[]`.

<work_experience>
{section_data}
</work_experience>

<job_description>
{job_description}
</job_description>

<example>
"work_experience": [
    {{
      "role": "Software Engineer",
      "company": "Winjit Technologies",
      "location": "Pune, India"
      "from_date": "Jan 2020",
      "to_date": "Jun 2022",
      "description": [
        "Engineered 10+ RESTful APIs Architecture and Distributed services; Designed 30+ low-latency responsive UI/UX application features with high-quality web architecture; Managed and optimized large-scale Databases. (Systems Design)",  
        "Initiated and Designed a standardized solution for dynamic forms generation, with customizable CSS capabilities feature, which reduces development time by 8x; Led and collaborated with a 12 member cross-functional team. (Idea Generation)"  
        and so on ...
      ]
    }},
    {{
      "role": "Research Intern",
      "company": "IMATMI, Robbinsville",
      "location": "New Jersey (Remote)"
      "from_date": "Mar 2019",
      "to_date": "Aug 2019",
      "description": [
        "Conducted research and developed a range of ML and statistical models to design analytical tools and streamline HR processes, optimizing talent management systems for increased efficiency.",
        "Created 'goals and action plan generation' tool for employees, considering their weaknesses to facilitate professional growth.",
        and so on ...
      ]
    }}
  ],
</example>

{format_instructions}
"""