import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/client";
import { employeeService } from "../../modules/employees/services/employee.service";
import { useAuth } from "../../app/providers/AuthProvider";
import { DepartmentSelect } from "../../components/forms/DepartmentSelect";
import { getDemoUserProfiles, isDemoMode } from "../../modules/demo/seed";
export default function EmployeesPage() {
  const [employees, setEmployees] =
    useState<any[]>([]);
const { profile } = useAuth();
console.log("PROFILE", profile);
  const [loading, setLoading] =
    useState(true);
const [showForm, setShowForm] =
  useState(false);

const [fullName, setFullName] =
  useState("");

const [email, setEmail] =
  useState("");

const [department, setDepartment] =
  useState("");

const [designation, setDesignation] =
  useState("");
  const [
  reportingManager,
  setReportingManager,
] = useState("");
  const [profiles, setProfiles] =
  useState<any[]>([]);

const [selectedProfileId, setSelectedProfileId] =
  useState("");
  const [selectedEmployee, setSelectedEmployee] =
  useState<any>(null);
  useEffect(() => {
  loadEmployees();
  loadProfiles();
}, []);

  async function loadEmployees() {
    try {
      const data =
        await employeeService.getAll();

      setEmployees(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  async function loadProfiles() {
  if (isDemoMode()) {
    setProfiles(getDemoUserProfiles());
    return;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("is_active", true)
    .order("full_name");

  if (error) {
    console.error(error);
    setProfiles(getDemoUserProfiles());
    return;
  }

  setProfiles(data?.length ? data : getDemoUserProfiles());
}
async function createEmployee() {
  try {
    await employeeService.create({
      profile_id: selectedProfileId,
employee_code: "EMP-" + Date.now(),
full_name: fullName,
email,
department,
designation,
reporting_manager:
  reportingManager,
    });

    setShowForm(false);

    setSelectedProfileId("");
    setFullName("");
    setEmail("");
    setDepartment("");
    setDesignation("");
setReportingManager("");
    loadEmployees();

  } catch (error) {
    console.error(error);
    alert("Failed");
  }
}

  if (loading) {
    return <div>Loading Employees...</div>;
  }

  return (
    <>
    {selectedEmployee && (
  <div
    style={{
      padding: "20px",
      marginBottom: "20px",
      border: "1px solid #334155",
      borderRadius: "12px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h2>Employee Profile</h2>

      <button
        onClick={() =>
          setSelectedEmployee(null)
        }
      >
        Close
      </button>
    </div>

    <p>
      <strong>Name:</strong>{" "}
      {selectedEmployee.full_name}
    </p>

    <p>
      <strong>Email:</strong>{" "}
      {selectedEmployee.email}
    </p>

    <p>
      <strong>Department:</strong>{" "}
      {selectedEmployee.department}
    </p>

    <p>
  <strong>Designation:</strong>{" "}
  {selectedEmployee.designation}
</p>

<p>
  <strong>Reporting Manager:</strong>{" "}
  {selectedEmployee.reporting_manager || "-"}
</p>

<p>
  <strong>Status:</strong>{" "}
  {selectedEmployee.status}
</p>

    <p>
      <strong>Employee Code:</strong>{" "}
      {selectedEmployee.employee_code}
    </p>
  </div>
)}
    {showForm && (
  <div
    style={{
      padding: "20px",
      marginBottom: "20px",
      border: "1px solid #334155",
      borderRadius: "12px",
    }}
  >
    <h3>Add Employee</h3>
<select
  value={selectedProfileId}
  onChange={(e) => {
    const id = e.target.value;

    setSelectedProfileId(id);

    const selected = profiles.find(
      (p) => p.id === id
    );

    if (selected) {
      setFullName(selected.full_name);
      setEmail(selected.email);
    }
  }}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  }}
>
  <option value="">
    Select User
  </option>

  {profiles.map((profile) => (
    <option
      key={profile.id}
      value={profile.id}
    >
      {profile.full_name} ({profile.role})
    </option>
  ))}
</select>
    <input
      placeholder="Full Name"
      value={fullName}
      onChange={(e) =>
        setFullName(e.target.value)
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
      }}
    />

    <input
      placeholder="Email"
      value={email}
      onChange={(e) =>
        setEmail(e.target.value)
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
      }}
    />

    <DepartmentSelect
      value={department}
      onChange={setDepartment}
      required
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
      }}
    />

    <input
      placeholder="Designation"
      value={designation}
      onChange={(e) =>
        setDesignation(e.target.value)
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
      }}
    />
    <input
  placeholder="Reporting Manager"
  value={reportingManager}
  onChange={(e) =>
    setReportingManager(
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  }}
/>

    <button
      onClick={createEmployee}
      style={{
        padding: "10px 16px",
        marginRight: "10px",
      }}
    >
      Save Employee
    </button>

    <button
      onClick={() =>
        setShowForm(false)
      }
    >
      Cancel
    </button>
  </div>
)}
    <div>
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  }}
>
  <h1
    style={{
      fontSize: "28px",
      fontWeight: 700,
    }}
  >
    Employees
  </h1>

  <button
  onClick={() =>
    setShowForm(true)
  }
  style={{
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  }}
>
  Add Employee
</button>
</div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
  <th>Name</th>
  <th>Email</th>
  <th>Department</th>
  <th>Designation</th>
  <th>Reporting Manager</th>
  <th>Status</th>
</tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
  <button
    onClick={() =>
      setSelectedEmployee(employee)
    }
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    {employee.full_name}
  </button>
</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.designation}</td>
<td>
  {employee.reporting_manager || "-"}
</td>
<td>{employee.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
   </div>
</>
);
}