export function generateLOATemplate(data: any) {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Letter of Acceptance – Recrulyn Technologies</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* ─── Reset ──────────────────────────────────────────────── */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
 
   html,
body {
  margin: 0;
  padding: 0;
  width: 210mm;
  min-height: 297mm;
  background: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  color: #1a1a1a;
}
.page{
    width:210mm;
    height:297mm;
    background:#fff;
    position:relative;
    overflow:hidden;
}
/* ─── Header Bar ─────────────────────────────────────────── */

.header{
    width:100%;
    height:60px;   /* adjust to your actual banner height */
    overflow:hidden;
}

.header-image{
    display:block;
    width:100%;
    height:100%;
    object-fit:cover;
}
/* ─── Body Content ───────────────────────────────────────── */
.body-content{
 padding:8px 58px 18px 58px;}

/* ─── Document Title ─────────────────────────────────────── */
.doc-title{
  text-align:center;
  font-family:'Montserrat',sans-serif;
  font-size:24pt;
  font-weight:900;
  letter-spacing:0.5px;
  margin:7px 0 18px;
  text-transform:uppercase;
}

/* ─── Salutation ─────────────────────────────────────────── */
.salutation{
  font-size:18pt;
  font-weight:700;
  margin-bottom:12px;
}

/* ─── Body Paragraphs ────────────────────────────────────── */
.body-para{
  font-family:Arial,Helvetica,sans-serif;
  font-size:14pt;
  line-height:1.5;
  text-align:justify;
  margin-bottom:10px;
}
.body-para .bold {
  font-weight: 700;
}

/* ─── Details Block ──────────────────────────────────────── */
.details-block{
  margin:10px 0 12px;
}
.details-row{
  display:flex;
  margin-bottom:3px;
  font-family:Arial,Helvetica,sans-serif;
  font-size:14pt;
}
.details-label{
  min-width:175px;
  font-weight:600;
}

.details-colon{
  width:18px;
  text-align:center;
}
.details-value{
  flex:1;
}

/* ─── Footer Section ─────────────────────────────────────── */
.footer-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 4px;
}

/* Left: Company block */
.company-block {
  width: 55%;
  padding-right: 20px;
  padding-top: 2px;
}

.company-name {
  font-size: 11pt;
  font-weight: 700;
  margin-bottom: 4px;
  color: #1a1a1a;
}

.company-address {
  font-size: 11pt;
  line-height: 1.4;
  color: #1a1a1a;
  margin-bottom: 3px;
  font-weight: 500;
}

.company-reg {
  font-size: 11pt;
  line-height: 1.4;
  color: #1a1a1a;
  font-weight: 500;
}

/* Right: Seal + Signature + Officer block */
.officer-block {
  width: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top:-18px;
}

/* Seal + Signature */
.seal-sig-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
  margin-bottom: 10px;
}

.seal-area {
  width: 90px;
  height: 90px;
  margin-bottom: 20px;
}

.signature-area {
  width: 150px;
  height: 60px;
}

.seal-area img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.signature-area img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.officer-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 12pt;
  font-weight: 700;
  text-align: center;
  margin-top: 6px;
}

.officer-designation {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10pt;
  font-weight: 600;
  text-align: center;
  margin-top: 3px;
}
    /* ─── Playwright PDF print rules ────────────────────────── */
    @page {
      size: A4;
      margin: 0;
    }
 
    @media print {
      html, body {
        margin: 0;
        padding: 0;
      }
      .page {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- ══════════════════════════════════════════
         HEADER BAR
         ══════════════════════════════════════════ -->
 <div class="header">
 
    <img
         src="${data.headerImage}"
        class="header-image"
    />
</div>


   

    <!-- ══════════════════════════════════════════
         BODY CONTENT
         ══════════════════════════════════════════ -->
    <div class="body-content">

      <!-- Document Title -->
      <div class="doc-title">Letter of Acceptance</div>

      <!-- Salutation -->
      <div class="salutation">To Whom It May Concern,</div>

      <!-- Opening paragraph -->
      <p class="body-para">
        We are pleased to inform you that <span class="bold">${data.candidate_name}</span> has been offered
        an internship with <span class="bold">RECRULYN TECHNOLOGIES</span>, and we are pleased to
        provide this valuable opportunity as part of <span class="bold">${data.internship_drive}</span>. This
        internship is aligned with intern(s) academic curriculum and is intended
        to provide industry exposure and applied learning opportunities. The
        student's particulars are as follows:
      </p>

      <!-- Internship Details -->
      <div class="details-block">
        <div class="details-row">
          <span class="details-label">Internship Enrolled</span>
          <span class="details-colon">&nbsp;:&nbsp;</span>
          <span class="details-value">${data.internship_role}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Internship Type</span>
          <span class="details-colon">&nbsp;:&nbsp;</span>
          <span class="details-value">${data.internship_type}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Department/Sector</span>
          <span class="details-colon">&nbsp;:&nbsp;</span>
          <span class="details-value">${data.department}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Period of Internship</span>
          <span class="details-colon">&nbsp;:&nbsp;</span>
          <span class="details-value">${data.start_date} - ${data.end_date}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Work Mode</span>
          <span class="details-colon">&nbsp;:&nbsp;</span>
          <span class="details-value">${data.work_mode}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Working Hours</span>
          <span class="details-colon">&nbsp;:&nbsp;</span>
          <span class="details-value">${data.working_hours}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Project Title</span>
          <span class="details-colon">&nbsp;:&nbsp;</span>
          <span class="details-value">${data.project_title}</span>
        </div>
      </div>

      <!-- Second paragraph -->
      <p class="body-para">
        As an intern, ${data.candidate_name} will be involved in a variety of projects
        and will have the opportunity to gain hands-on-experience in their field
        of study. The program is for independent research by students but
        supervised in a respective field of study during the internship period, at
        the end of which report and oral defense presentation is submitted and
        examined.
      </p>

      <!-- Third paragraph -->
      <p class="body-para">
        At RECRULYN TECHNOLOGIES, we are committed to providing our interns
        with positive and productive work experience. We will work closely with
        intern(s) to ensure that they receive the necessary support and guidance
        throughout their internship.
      </p>

      <!-- Date -->
     <div class="date-line">
  Date: ${data.issue_date}
</div>

      <!-- ══════════════════════════════════════════
           FOOTER: Company Info (left) + Seal/Sig (right)
           ══════════════════════════════════════════ -->
      <div class="footer-section">

        <!-- Left: Company block -->
        <div class="company-block">
          <div class="company-name">RECRULYN TECHNOLOGIES PRIVATE LIMITED</div>
          <div class="company-address">
            No 1, Nehru Street, Vasantham Nagar,<br>
            Avadi, Chennai, TN, India - 600071
          </div>
          <div class="company-reg">
            GST: 33AANCR7992N1ZD<br>
            CIN: U26515TN2024PTC171846
          </div>
        </div>

        <!-- Right: Seal → Signature → Officer Name/Designation -->
        <div class="officer-block">

  <div class="seal-sig-wrap">

    <div class="seal-area">
      <img src="${data.seal_url}" />
    </div>

    <div class="signature-area">
      <img src="${data.signature_url}" />
    </div>

  </div>

  <div class="officer-name">
    ${data.officer_name}
  </div>

  <div class="officer-designation">
    ${data.officer_designation}|Recrulyn Technologies
  </div>

</div>
      </div>
      <!-- end footer-section -->

    </div>
    <!-- end body-content -->

  </div>
  <!-- end page -->
</body>
</html>`;} 