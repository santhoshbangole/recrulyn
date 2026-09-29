export function generateCertificateTemplate(data: any) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<title>Certificate of Internship</title>

<style>

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

@page{
  size:A4;
  margin:0;
}

html,body{
  width:210mm;
 
  background:#ffffff;
  font-family:Arial,sans-serif;
}

.page{
  width:210mm;
  
  position:relative;
  overflow:hidden;
  background:#fff;
}

/* HEADER */

.header-bar{
  margin-top:18px;
  width:100%;
  height:42px;
  background:#3a3a3a;
  display:flex;
  align-items:center;
}

.logo-box{
  width:230px;
  margin-left:16px;
  position:relative;
  top:8px;
  z-index:10;
}

.logo-box img{
  width:100%;
}

/* TITLE */

.certificate-title{
  text-align:center;
  margin-top:32px;
  font-size:21pt;
  font-weight:800;
  letter-spacing:1px;
  color:#1a1a1a;
}

/* CONTENT */

.content-wrapper{
  position:relative;
  margin-top:25px;
  padding-left:35px;
  padding-right:35px;
}

.award-ribbon{
  position:absolute;
  left:35px;
  top:0;
  width:70px;
}

.award-ribbon img{
  width:100%;
}

.main-content{
  padding-left:95px;
}

.acknowledge{
  text-align:center;
  font-size:13pt;
  color:#222;
  margin-top:20px;
}

.candidate-name{
  text-align:center;
  font-family:Georgia,serif;
  font-size:26pt;
  font-weight:700;
  margin-top:18px;
  margin-bottom:22px;
  color:#111;
}

.para{
  font-size:10.5pt;
  line-height:1.6;
  text-align:left;
  color:#111;
  margin-bottom:18px;
}

.bold{
  font-weight:700;
}
  /* FOOTER */

.footer{
 margin-top:60px;
  position:absolute;
  left:30px;
  right:30px;
  bottom:22px;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
}

.left-footer{
  width:50%;
}

.date-place{
  font-size:10pt;
  line-height:1.8;
  margin-bottom:18px;
  color:#111;
}

.company-name{
  font-size:11pt;
  font-weight:700;
  margin-bottom:6px;
  color:#111;
}

.company-info{
  font-size:8.8pt;
  line-height:1.6;
  color:#111;
}

.right-footer{
  width:260px;
  position:relative;
  text-align:center;
}

.seal{
  position:absolute;
  left:40px;
  top:-95px;
  width:80px;
  z-index:1;
}

.seal img{
  width:100%;
}

.signature{
  width:150px;
  margin:0 auto;
  position:relative;
  z-index:2;
}

.signature img{
  width:100%;
  max-height:70px;
  object-fit:contain;
}

.officer-name{
  margin-top:2px;
  font-size:12pt;
  font-weight:700;
  color:#111;
}

.officer-designation{
  margin-top:4px;
  font-size:10pt;
  color:#444;
  letter-spacing:1px;
}

</style>
</head>

<body>

<div class="page">

<div class="header-bar">
  <div class="logo-box">
    <img src="${data.logo_url}">
  </div>
</div>

<div class="certificate-title">
  CERTIFICATE OF INTERNSHIP
</div>

<div class="content-wrapper">

  <div class="award-ribbon">
    <img src="${window.location.origin}/award.png">
  </div>

  <div class="main-content">

    <div class="acknowledge">
      This certificate acknowledges that
    </div>

    <div class="candidate-name">
      ${data.candidate_name}
    </div>

    <div class="para">
      has successfully completed a two-month Summer internship drive from
      <span class="bold">${data.start_date}</span>
      to
      <span class="bold">${data.end_date}</span>.
      During this period, the student worked on a project titled
      <span class="bold">${data.project_name}</span>.
    </div>

    <div class="para">
      This project was submitted as a partial fulfillment of the requirements
      for the Degree of Bachelor of Technology in Computer Science and Engineering.
      It is hereby certified that this record represents a genuine and authentic
      account of the work conducted under the guidance and supervision of
      Recrulyn Technologies.
    </div>

    <div class="para">
      We are pleased to state that the student's work met our satisfaction and
      is deserving of appreciation.
    </div>

  </div>

</div>

<div class="footer">

  <div class="left-footer">

    <div class="date-place">
      Date: ${data.issue_date}<br>
      Place: Chennai, India
    </div>

    <div class="company-name">
      RECRULYN TECHNOLOGIES PRIVATE LIMITED
    </div>

    <div class="company-info">
      No 1, Nehru Street, Vasantham Nagar,<br>
      Avadi, Chennai, TN, India - 600071<br>
      GST: 33AANCR7992N1ZD<br>
      CIN: U26515TN2024PTC171846
    </div>

  </div>

  <div class="right-footer">

    <div class="seal">
      <img src="${data.seal_url}">
    </div>

    <div class="signature">
      <img src="${data.signature_url}">
    </div>

    <div class="officer-name">
      ${data.officer_name}
    </div>

    <div class="officer-designation">
      ${data.officer_designation}
    </div>

  </div>

</div>

</div>

</body>
</html>
`;
}