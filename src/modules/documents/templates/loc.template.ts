export function generateLOCTemplate(
  data: {
    candidate_name: string;
    role_name: string;
    department: string;
    joining_date: string;
    reporting_manager: string;

    officer_name: string;
    officer_designation: string;

    logo_url?: string;
    seal_url?: string;
    signature_url?: string;
  }
) {
  return `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #111;
      }

      .header {
        text-align: center;
        margin-bottom: 40px;
      }

      .logo {
        height: 80px;
      }

      .title {
        font-size: 24px;
        font-weight: bold;
        margin-top: 20px;
      }

      .content {
        font-size: 14px;
        line-height: 1.8;
      }

      .footer {
        margin-top: 50px;
      }

      .signature {
        height: 70px;
      }

      .seal {
        height: 90px;
      }
    </style>
  </head>

  <body>

    <div class="header">
      <img
        src="${data.logo_url || ""}"
        class="logo"
      />

      <div class="title">
        LETTER OF CONFIRMATION
      </div>
    </div>

    <div class="content">

      <p>
        This is to formally confirm that
        <strong>${data.candidate_name}</strong>
        has successfully joined Recrulyn Technologies.
      </p>

      <p>
        Designation:
        <strong>${data.role_name}</strong>
      </p>

      <p>
        Department:
        <strong>${data.department}</strong>
      </p>

      <p>
        Joining Date:
        <strong>${data.joining_date}</strong>
      </p>

      <p>
        Reporting Manager:
        <strong>${data.reporting_manager}</strong>
      </p>

      <p>
        We welcome the candidate to the organization and wish them success during their internship journey.
      </p>

    </div>

    <div class="footer">

      <img
        src="${data.signature_url || ""}"
        class="signature"
      />

      <br/>

      <strong>
        ${data.officer_name}
      </strong>

      <br/>

      ${data.officer_designation}

      <br/><br/>

      <img
        src="${data.seal_url || ""}"
        class="seal"
      />

    </div>

  </body>
  </html>
  `;
}