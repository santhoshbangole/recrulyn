export interface EmailTemplate {

  id: string;

  name: string;

  subject: string;

  body: string;

}

export const emailTemplates: EmailTemplate[] = [

  {
    id: "internship_confirmation",

    name: "Internship Confirmation",

    subject: "Confirmation of Internship Offer - RECRULYN",

    body: `
Dear {{candidateName}},

Good day,

Based on your all round of interviews, we are delighted to inform you that an internship position at Recrulyn Technologies has been offered. We are excited to have you join our team and look forward to working with you.

Congratulations!

Please let us know by replying to this email if you would like to accept this internship and your  

Earliest joining date: 
Internship Duration:  
University Supervisor Name [If any]: 
Project Title [If any]:  
Willing to work as a team with another intern: Yes/No

to proceed further with the internship agreement documents. We will start to prepare the paperwork for you and in order to complete it, we need a few details from you to finish. 
Please send the following requirements: 
1) CV or Resume (updated) 
2) ID- proof (any two ID particulars) 
3) Passport picture 

Should you have any questions or concerns please do not hesitate to write to me. 
Best Regards, 


`,
  },

  {
    id: "interview",

    name: "Interview Invitation",

    subject: "Interview Invitation",

    body: `
Dear {{candidateName}},

I hope this message finds you well. We appreciate the time and effort you've taken in 
applying for the {{position}} position at Recrulyn. Your application stood out to us, and 
we're excited about the possibility of you joining our team. 
We would like to invite you for an interview to discuss how your skills and experience 
align with the job description and to explore your potential fit within our organization. 
The interview will be an opportunity for us to delve deeper into your qualifications 
and to provide you with a clearer understanding of the role. 
Interview Details: 
- Date:  
- Time:  
- Location:  
During the interview, we'll delve into your background, experiences, and how they 
correlate with the responsibilities and expectations of the {{position}} position. We'll 
also address any questions or clarifications you may have regarding the role, our 
company culture, and the opportunities for growth within {{companyName}}. 
Please come prepared to discuss specific examples from your previous roles that 
highlight your relevant skills, as well as any questions you may have for us. Our aim 
is to ensure a comprehensive and productive discussion that benefits both parties. 
If the provided interview time is not suitable for you, please let us know at your 
earliest convenience, and we'll do our best to accommodate your schedule. 
To confirm your availability or to request a rescheduling, kindly reply to this email or 
contact us at [Contact Information]. 
We look forward to meeting you and exploring the potential of working together. 
Thank you once again for your interest in joining [Company Name]. 
 

`,
  },

  {
    id: "rejection",

    name: "Rejection Email",

    subject: "Internship Application Status",

    body: `
Dear {{candidateName}},

I hope this message finds you well. I want to personally thank you for your interest in 
the {{position}} at {{companyName}}. We appreciate the time and effort you 
put into your application and interviews. 
After careful consideration, we regret to inform you that we have chosen to move 
forward with another candidate for this internship position. This decision was not 
easy, as we received many strong applications, including yours. 
Please do not let this deter you from pursuing future opportunities with {{companyName}}. We were impressed with your qualifications and believe that your skills and 
experiences could be a great fit for us in the future. 
We encourage you to continue seeking out internships and professional experiences 
that align with your career goals. Your dedication to personal and professional 
growth is admirable, and we have no doubt that you will find a valuable opportunity 
soon. 
Thank you once again for considering {{companyName}} for your internship 
experience. We wish you the best of luck in all your future endeavors. 
`,
  },

];