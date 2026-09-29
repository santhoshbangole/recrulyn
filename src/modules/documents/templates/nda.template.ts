// ============================================================
// Recrulyn Technologies — NDA Template
// Pixel-perfect recreation of NDA template.docx
// Compatible with html2pdf.js (jsPDF engine)
//
// Usage:
//   const html = generateNDATemplate(data);
//   html2pdf().set({
//     margin: 0,
//     filename: 'NDA.pdf',
//     image: { type: 'jpeg', quality: 0.98 },
//     html2canvas: { scale: 2, useCORS: true, letterRendering: true },
//     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
//     pagebreak: { mode: ['avoid-all', 'css'] }
//   }).from(html).save();
// ============================================================


export function generateNDATemplate(data: any): string {
  // const issueDateDisplay   = data.issue_date      || "";
  // const candidateName      = data.candidate_name  || "";
  // const guardianName       = data.guardian_name   || "";
  // const area               = data.area            || "";
  // const district           = data.district        || "";
  // const state              = data.state           || "";
  // const pincode            = data.pincode         || "";
  // const internshipRole     = data.internship_role || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
/* ─── Reset ────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ─── Root / page canvas ────────────────────────────────────
   html2pdf renders the entire body as one tall canvas and then
   slices it into A4 pages (210 × 297 mm).
   We replicate page margins with a wrapper and use
   page-break-before on section divs to force new pages.        */
html, body {
  width: 210mm;
  margin: 0 auto;
  background: #fff;
  font-family: Calibri, "Segoe UI", Arial, sans-serif;
  font-size: 11pt;
  color: #000;
  line-height: 1.45;
}

.page{
  width:210mm;
  padding:25mm 20mm;
  font-family:"Times New Roman", serif;
  color:#000;
  font-size:11pt;
  line-height:1.5;
}

.nda-header{
  text-align:center;
  font-weight:bold;
  font-size:13pt;
  margin-bottom:30px;
}

.intro-paragraph{
  text-align:justify;
  margin-bottom:18px;
}

.party-block{
  text-align:justify;
  margin-bottom:18px;
}

.center-text{
  text-align:center;
  margin:14px 0;
}

.whereas-title{
  font-weight:bold;
  margin-top:15px;
  margin-bottom:10px;
}

.whereas-point{
  margin-bottom:8px;
  text-align:justify;
}

.body-text{
  text-align:justify;
  margin-top:12px;
  margin-bottom:18px;
}

.section-heading{
  text-align:center;
  font-weight:bold;
  margin-top:25px;
  margin-bottom:18px;
}
  .clause-title{
  font-weight:bold;
  margin-top:18px;
  margin-bottom:8px;
}

.clause-text{
  text-align:justify;
  margin-bottom:8px;
  line-height:1.5;
}

.sub-clause{
  text-align:justify;
  margin-left:18px;
  margin-bottom:6px;
  line-height:1.5;
}
  .witness-block{
  margin-top:35px;
}

.signature-wrapper{
  display:flex;
  justify-content:space-between;
  margin-top:35px;
}

.signature-column{
  width:45%;
}

.party-title{
  font-weight:bold;
  margin-bottom:50px;
}

.signature-line{
  border-top:1px solid #000;
  width:250px;
  margin-bottom:12px;
}

.signature-info{
  margin-bottom:6px;
}
/* ─── Now-therefore ─────────────────────────────────────────*/
.ntb { font-size: 11pt; font-weight: bold; text-align: justify; margin-top: 22pt; }
</style>
</head>
<body>
<div class="page">

  <div class="nda-header">
    PRIVILEGED AND CONFIDENTIAL
  </div>

  <div class="intro-paragraph">
    This Non-Disclosure Agreement (NDA), hereinafter referred to as the
    <b>“Agreement”</b>, is made and entered into as of
    <b>${data.issue_date}</b> by and between
  </div>

  <div class="party-block">
    <b>RECRULYN TECHNOLOGIES PRIVATE LIMITED</b>,
    a tech-based company having its registered office at
    No. 1, Nehru Street, Vasantham Nagar, Avadi,
    Kamaraj Nagar, Poonamalle, Tiruvallur - 600071,
    Tamil Nadu, India,
    hereinafter referred to as the
    <b>“Disclosing Party”</b> or
    <b>“Employer”</b>
  </div>

  <div class="center-text">
    And
  </div>

  <div class="party-block">
    <b>${data.candidate_name}</b>
    S/O
    <b>${data.guardian_name}</b>
    residing at
    <b>
      ${data.area},
      ${data.district} -
      ${data.pincode},
      ${data.state},
      India
    </b>,
    hereinafter referred to as
    <b>“Receiving Party”</b>
    or
    <b>“Employee”</b>
    or
    <b>“Consultant”</b>
  </div>

  <div class="center-text">
    Individually referred to as
    <b>Party</b>
    and collectively referred to as
    <b>“Parties”</b>
  </div>

  <div class="whereas-title">
    WHEREAS,
  </div>

  <div class="whereas-point">
    a. The Disclosing Party or Employer is engaged in the business of
    providing Design and Manufacturing.
  </div>

  <div class="whereas-point">
    b. The Employee or Consultant is an engineer who will be rendering
    his/her services to the Employer’s Company.
  </div>

  <div class="whereas-point">
    c. This Agreement acknowledges that certain confidential or proprietary
    information (hereinafter defined and referred to as
    “Confidential Information”) of or regarding the Company may be discussed
    between the Parties.
  </div>

  <div class="body-text">
    In consideration of the mutual promises and agreements between the
    parties hereto, the parties have agreed to enter into this Agreement to
    govern the terms and conditions of their association.
  </div>

  <div class="section-heading">
    NOW THEREFORE IT IS HEREBY AGREED BY AND AMONGST THE PARTIES AS UNDER:
  </div>
<div class="section-heading">
  NOW THEREFORE IT IS HEREBY AGREED BY AND AMONGST THE PARTIES AS UNDER:
</div>
<div class="clause-title">
  1. Confidential Information:
</div>

<div class="clause-text">
  “Confidential Information” shall mean and include any Confidential or
  Proprietary Information related to the Company disclosed by the Employer
  (Disclosing Party) to the Employee (Receiving Party) either directly or
  indirectly, in writing, orally, or by inspection of tangible objects
  (including, without limitation, documents, prototypes, samples, media,
  documentation, discs, and code).
</div>

<div class="clause-text">
  Confidential Information shall include, without limitation:
</div>

<div class="sub-clause">
  <b>a.</b> All information relating to the Company’s products, business,
  and operations, including but not limited to financial documents and plans,
  customers, suppliers, manufacturing partners, marketing strategies,
  vendors, products, product development plans, technical product data,
  product samples, costs, sources, strategies, operations procedures,
  proprietary concepts, inventions, sales leads, sales data, customer lists,
  customer profiles, technical advice or knowledge, contractual agreements,
  price lists, supplier lists, sales estimates, product specifications,
  trade secrets, distribution methods, inventories, marketing strategies,
  source code, software, algorithms, data, patents, trademarks, service
  marks, logos, trade names, internet or website domain names, rights in
  designs, drawings or schematics, blueprints, computer programs and
  systems, and know-how or other intellectual property of the Company and
  its affiliates that may be at any time furnished, communicated or
  delivered by the Company to the Employee, whether in oral, tangible,
  electronic or other forms.
</div>

<div class="sub-clause">
  <b>b.</b> The terms of any agreement, including this Agreement and the
  discussions, negotiations, and proposals related to any agreement.
</div>

<div class="sub-clause">
  <b>c.</b> All other non-public information provided by the Company
  whatsoever.
</div>

<div class="clause-text">
  All Confidential Information shall remain the property of the Company.
</div>
<div class="clause-title">
  2. Treatment of Confidential Information:
</div>

<div class="clause-text">
  The Receiving Party shall hold the Confidential Information in strictest
  confidence at all times in perpetuity and shall not use or disclose the
  Confidential Information without the prior written consent of the
  Disclosing Party, which consent may be withheld at the Disclosing Party’s
  sole discretion.
</div>

<div class="clause-text">
  The Receiving Party shall:
</div>

<div class="sub-clause">
  <b>a.</b> use Confidential Information only for the purpose of fulfilment
  of employment obligations and duties.
</div>

<div class="sub-clause">
  <b>b.</b> not copy any Confidential Information except as expressly
  permitted by the Disclosing Party.
</div>

<div class="sub-clause">
  <b>c.</b> not disclose Confidential Information to any third party except
  as expressly permitted in writing by the Disclosing Party.
</div>

<div class="sub-clause">
  <b>d.</b> limit dissemination of Confidential Information only to persons
  who need to know such Confidential Information.
</div>

<div class="sub-clause">
  <b>e.</b> not remove or obscure proprietary rights notices appearing on
  Confidential Information.
</div>

<div class="sub-clause">
  <b>f.</b> advise the Disclosing Party promptly in writing of any
  unauthorized disclosure or use of Confidential Information.
</div>

<div class="sub-clause">
  <b>g.</b> use at least the same degree of care to protect the
  confidentiality of Confidential Information as used for their own
  confidential information.
</div>

<div class="sub-clause">
  <b>h.</b> not reverse engineer, decompile, or disassemble Confidential
  Information in any manner leading to breach of this Agreement.
</div>

<div class="clause-text">
  This Agreement grants no rights in or to the Confidential Information.
  All Confidential Information shall remain the sole property of the PARTY
  and maintain status quo.
</div>
<div class="clause-title">
  3. Return of Confidential Information:
</div>

<div class="clause-text">
  All Confidential Information exchanged, shared electronically and/or
  otherwise, as well as any copies thereof, shall, as and when required,
  upon the respective request of the Disclosing Party, be returned or
  destroyed by the Receiving Party.
</div>
<div class="clause-title">
  4. Exceptions to the Obligation of Confidentiality:
</div>

<div class="clause-text">
  The confidentiality obligations do not apply to information that:
</div>

<div class="sub-clause">
  <b>a.</b> was in the Receiving Party’s possession without confidentiality
  obligation prior to receipt.
</div>

<div class="sub-clause">
  <b>b.</b> is already publicly available or subsequently becomes publicly
  available through no breach by the Receiving Party.
</div>

<div class="sub-clause">
  <b>c.</b> is lawfully obtained from a third party without obligation of
  confidentiality.
</div>

<div class="sub-clause">
  <b>d.</b> is independently developed without reference to Confidential
  Information.
</div>

<div class="sub-clause">
  <b>e.</b> is required to be disclosed by law, court order, government
  agency, subpoena, or legal process.
</div>

<div class="sub-clause">
  <b>f.</b> is approved for public release by written agreement of the
  Disclosing Party.
</div>
<div class="clause-title">
  5. No License, Conveyance, or Warranty:
</div>

<div class="clause-text">
  Nothing in this Agreement shall convey to the Receiving Party any right,
  title, interest, or license in or to any Confidential Information,
  materials, trademark, trade name, patent, copyright, or other intellectual
  property rights of the Disclosing Party.
</div>

<div class="clause-text">
  Nothing in this Agreement shall constitute any representation, warranty,
  assurance, or guarantee regarding non-infringement of trademarks,
  patents, copyrights, methodologies, intellectual property rights,
  processes, or other property rights.
</div>

<div class="clause-text">
  ALL CONFIDENTIAL INFORMATION FURNISHED UNDER THIS AGREEMENT IS PROVIDED
  BY THE DISCLOSING PARTY “AS-IS, WITH ALL FAULTS.”
</div>

<div class="clause-text">
  THE DISCLOSING PARTY DOES NOT MAKE ANY WARRANTIES, EXPRESS OR IMPLIED,
  REGARDING THE ACCURACY, COMPLETENESS, PERFORMANCE, MERCHANTABILITY,
  FITNESS FOR USE, NON-INFRINGEMENT, OR OTHER ATTRIBUTES OF ITS
  CONFIDENTIAL INFORMATION.
</div>
<div class="witness-block">

  <div class="clause-text">
    <b>
      IN WITNESS WHEREOF,
    </b>
    the parties hereto have executed this Agreement
    as of the above-mentioned date.
  </div>

  <div class="signature-wrapper">

    <div class="signature-column">

      <div class="party-title">
        RECRULYN
      </div>

      <div class="signature-line"></div>

      <div class="signature-info">
        <b>By:</b>
      </div>

      <div class="signature-info">
        <b>Name:</b> Reginald C
      </div>

      <div class="signature-info">
        <b>Title:</b> Managing Director
      </div>

      <div class="signature-info">
        <b>Date:</b> ${data.issue_date}
      </div>

    </div>

    <div class="signature-column">

      <div class="party-title">
        EMPLOYEE
      </div>

      <div class="signature-line"></div>

      <div class="signature-info">
        <b>By:</b>
      </div>

      <div class="signature-info">
        <b>Name:</b>
        ${data.candidate_name}
      </div>

      <div class="signature-info">
        <b>Title:</b>
        ${data.internship_role}
      </div>

      <div class="signature-info">
        <b>Date:</b>
        ${data.issue_date}
      </div>

    </div>

  </div>
</body>
</html>`;
}
