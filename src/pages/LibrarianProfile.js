import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getUser, saveUser, isLoggedIn, logout } from "../utils/auth";
import { ROLES, LIBRARY_DEPARTMENTS } from "../constants";

export default function LibrarianProfile() {
  const navigate = useNavigate();
  const user = getUser();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });
  const [errors, setErrors] = useState({});

  if (!isLoggedIn() || !user || user.role !== ROLES.LIBRARIAN) {
    return <Navigate to="/login" replace />;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const err = {};
    if (form.fullName.trim().length < 3)
      err.fullName = "Full name must be at least 3 characters";
    if (form.phone && !/^\d{10,15}$/.test(form.phone))
      err.phone = "Phone must be 10 to 15 digits";
    if (!form.department) err.department = "Please choose your department";
    return err;
  }

  function handleSave() {
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    saveUser({
      ...user,
      fullName: form.fullName.trim(),
      phone: form.phone,
      department: form.department,
    });
    setEditing(false);
  }

  function handleCancel() {
    setForm({
      fullName: user.fullName,
      phone: user.phone || "",
      department: user.department,
    });
    setErrors({});
    setEditing(false);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Librarian Profile</h2>
        <p className="subtitle">Library staff account</p>

        <label>Full name</label>
        {editing ? (
          <>
            <input name="fullName" value={form.fullName} onChange={handleChange} />
            {errors.fullName && <p className="error">{errors.fullName}</p>}
          </>
        ) : (
          <p>{user.fullName}</p>
        )}

        <label>Staff ID</label>
        <p>{user.studentId}</p>

        <label>Email</label>
        <p>{user.email}</p>

        <label>Library department</label>
        {editing ? (
          <>
            <select name="department" value={form.department} onChange={handleChange}>
              <option value="">Select department</option>
              {LIBRARY_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && <p className="error">{errors.department}</p>}
          </>
        ) : (
          <p>{user.department}</p>
        )}

        <label>Phone</label>
        {editing ? (
          <>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 01012345678" />
            {errors.phone && <p className="error">{errors.phone}</p>}
          </>
        ) : (
          <p>{user.phone || "Not added yet"}</p>
        )}

        <label>Library card</label>
        <p>{user.libraryCard}</p>

        {editing ? (
          <>
            <button onClick={handleSave}>Save</button>{" "}
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setEditing(true)}>Edit profile</button>
        )}

        <p className="link">
          <a href="/login" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            Log out
          </a>
        </p>
      </div>
    </div>
  );
}