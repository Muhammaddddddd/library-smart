import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, login } from "../utils/auth";
import { ROLES } from "../constants";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const err = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email address";
    if (!form.password) err.password = "Enter your password";
    return err;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    const user = getUser();
    if (!user) {
      setErrors({ form: "No account found. Please register first." });
      return;
    }

    const emailOk = user.email === form.email.trim().toLowerCase();
    if (!emailOk || user.password !== form.password) {
      setErrors({ form: "Incorrect email or password" });
      return;
    }

    login();
    navigate(user.role === ROLES.LIBRARIAN ? "/librarian-profile" : "/student-profile");
  }

  return (
    <div className="page bg-page bg-login">
      <form className="card" onSubmit={handleSubmit} noValidate>
        <h2>Welcome back</h2>
        <p className="subtitle">Log in to search, reserve and review books.</p>

        <label>University email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />
        {errors.password && <p className="error">{errors.password}</p>}

        {errors.form && <p className="error">{errors.form}</p>}

        <button type="submit">Log in</button>
        <p className="link">Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}