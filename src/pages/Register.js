import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FACULTIES, ROLES } from "../constants";
import { saveUser } from "../utils/auth";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    email: "",
    faculty: "",
    role: ROLES.STUDENT,
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // بترجّع object فيه الأخطاء (فاضي = كله تمام)
  function validate() {
    const err = {};
    if (form.fullName.trim().length < 3) err.fullName = "Full name must be at least 3 characters";
    if (!/^\d{6,10}$/.test(form.studentId)) err.studentId = "ID must be 6 to 10 digits";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email address";
    if (!form.faculty) err.faculty = "Please choose your faculty";
    if (form.password.length < 6 || !/\d/.test(form.password))
      err.password = "Password must be at least 6 characters and include a number";
    if (form.confirm !== form.password) err.confirm = "Passwords do not match";
    return err;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    // شكل البيانات المتفق عليه مع باقي التيم
    saveUser({
      fullName: form.fullName.trim(),
      studentId: form.studentId,
      email: form.email.trim().toLowerCase(),
      faculty: form.faculty,
      role: form.role,
      password: form.password,
      phone: "",
      interests: "",
      libraryCard: "LIB-" + form.studentId,
    });

    alert("Account created successfully. Please log in.");
    navigate("/login");
  }

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit} noValidate>
        <h2>Create your library account</h2>
        <p className="subtitle">Join Smart Library to search, reserve and review books.</p>

        <label>Full name</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} />
        {errors.fullName && <p className="error">{errors.fullName}</p>}

        <label>Student / Staff ID</label>
        <input name="studentId" value={form.studentId} onChange={handleChange} placeholder="e.g. 20231234" />
        {errors.studentId && <p className="error">{errors.studentId}</p>}

        <label>University email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Faculty</label>
        <select name="faculty" value={form.faculty} onChange={handleChange}>
          <option value="">Select faculty</option>
          {FACULTIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        {errors.faculty && <p className="error">{errors.faculty}</p>}

        <label>I am a</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value={ROLES.STUDENT}>Student</option>
          <option value={ROLES.LIBRARIAN}>Librarian</option>
        </select>

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />
        {errors.password && <p className="error">{errors.password}</p>}

        <label>Confirm password</label>
        <input name="confirm" type="password" value={form.confirm} onChange={handleChange} />
        {errors.confirm && <p className="error">{errors.confirm}</p>}

        <button type="submit">Create account</button>
        <p className="link">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}