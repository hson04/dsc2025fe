from typing import Dict

# Prompt rút gọn để đưa ra nhận xét cho CV dựa trên job description và alignment scores
GIVE_CV_COMMENT_PROMPT = """
Based on the CV, job description, and alignment scores listing satisfied and unsatisfied requirements, provide a review of the CV in English and return the output as JSON according to the specified format_instructions.

**Instructions:**
  - Provide a professional and natural review, addressing the user as "you":
    - **Advantages**: List the skills, experiences, or projects in your CV that align well with the job requirements.
    - **Disadvantages**: Identify specific skills or experiences you lack or need to improve to meet the job requirements.
  - Emphasize skills or experiences that match the job description (JD).
  - For areas needing improvement, focus on specific skill groups or requirements in the JD that the CV does not adequately meet, especially those with many unsatisfied requirements in the alignment scores.

- **Missing Information:**
  - **Missing CV Content**: Identify any essential CV sections or information that are completely missing from your CV content (e.g., missing contact information, work experience section, education section, skills section, etc.). For each missing section, provide specific guidance on what information should be included.
  - **Missing Skills**: List specific skills you need to add to your CV to better meet the job requirements, focusing only on skills related to unsatisfied requirements that can be supplemented through certifications, courses, or projects.
  - Focus on technical skills rather than generic requirements.
  - Each MissingInfoItem must include:
    - `field`: The specific skill or competency to be added (e.g., "Frontend Development Skills") or missing CV section (e.g., "Contact Information", "Work Experience Section").
    - `suggestion`: 
      - For missing CV sections: Provide specific guidance on what information should be included in that section.
      - For missing skills: Suggest specific ways to enhance the skill using the following format:
        "Enhance your [Skill Name] skills by (only include bullet points that are applicable to the specific skill):
        
        • List your [Skill]-related certifications (include details such as certificate name, provider, and URL link)
        • Add projects where you worked as a [Role] (include project name, project type, GitHub link, demo video/slides, timeline, and brief description)
        • Include [Skill]-related work experience (specify your role, company name, employment period, and job description)
        • Among the projects you've participated in, are there any that used [Skill] technologies mentioned but not yet listed?"
  - Use the JD to identify critical skills, prioritizing those related to unsatisfied requirements.

**CV Content (JSON):**
{resume_json}

**Job Description (JSON):**
{job_json}

**Alignment Scores (for reference only):**
{alignment_scores}

**Format Instructions:**
{format_instructions}

Provide a professional, natural review focused on the IT domain, using clear and understandable language. Avoid generic advice, focusing on specific skills from the CV and JD. Ensure the output is valid JSON according to the format_instructions.
"""