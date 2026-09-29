export function generateLORTemplate(data: any) {
return `

<!DOCTYPE html>

<html>
<head>
<meta charset="UTF-8">

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
  min-height:297mm;
  background:#ffffff;
  font-family:Arial,sans-serif;
  color:#1a1a1a;
}

.page{
  width:210mm;
  min-height:297mm;
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
}

.logo-box img{
  width:100%;
}

.content{
  padding:40px 55px;
}

.title{
  text-align:center;
  font-size:20pt;
  font-weight:700;
  letter-spacing:1px;
  margin-bottom:20px;
}

.date{
  text-align:right;
  font-size:10pt;
  margin-bottom:25px;
}

.salutation{
  font-size:12pt;
  font-weight:700;
  margin-bottom:20px;
}

.para{
  font-size:10.5pt;
  line-height:1.7;
  text-align:justify;
  margin-bottom:18px;
}

.footer{
  margin-top:70px;
  text-align:right;
}

.signature{
  width:140px;
  margin-left:auto;
}

.signature img{
  width:100%;
}

.name{
  font-size:12pt;
  font-weight:700;
}

.designation{
  font-size:10pt;
  margin-top:4px;
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

<div class="content">

<div class="title">
LETTER OF RECOMMENDATION
</div>

<div class="date">
Date: ${data.issue_date}
</div>

<div class="salutation">
To Whom It May Concern,
</div>

<div class="para">
I am pleased to recommend <strong>${data.candidate_name}</strong>,
who has been associated with Recrulyn Technologies during the internship period.
</div>

<div class="para">
During the internship, the candidate worked as
<strong>${data.role_name}</strong>
and contributed significantly to
<strong>${data.project_name}</strong>.
The candidate consistently demonstrated professionalism,
technical capability, responsibility and a willingness to learn.
</div>

<div class="para">
The candidate showed excellent teamwork,
communication skills and commitment toward assigned responsibilities.
Based on the performance observed during the internship,
I confidently recommend the candidate for future academic
and professional opportunities.
</div>

<div class="para">
I wish the candidate every success in future endeavors.
</div>

<div class="footer">

<div class="signature">
<img src="${data.signature_url}">
</div>

<div class="name">
${data.officer_name}
</div>

<div class="designation">
${data.officer_designation}
</div>

</div>

</div>

</div>

</body>
</html>
`;
}
