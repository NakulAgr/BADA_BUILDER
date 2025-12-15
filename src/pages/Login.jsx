import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Login.css";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [mode, setMode] = useState("login"); // login | register
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ------------------ HANDLE INPUT ------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ------------------ VALIDATION ------------------
  const validate = () => {
    const newErrors = {};

    if (mode === "register" && !formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password should be at least 6 characters.";
    }

    if (mode === "register") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------ LOGIN ------------------
  const loginUser = async (email, password) => {
    setLoading(true);
    setErrors({});

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (error) {
      let msg = "Login failed";
      if (error.code === "auth/user-not-found") msg = "User not found";
      if (error.code === "auth/wrong-password") msg = "Wrong password";
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ REGISTER ------------------
  const createUser = async (email, password, name) => {
    setLoading(true);
    setErrors({});

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        name,
        is_subscribed: false,
        subscription_expiry: null,
        created_at: new Date().toISOString(),
      });

      setMode("login");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({
        submit: "Registration successful! Please login with your credentials.",
      });
    } catch (error) {
      let msg = "Registration failed";
      if (error.code === "auth/email-already-in-use") {
        msg = "Email already registered";
      }
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ SUBMIT ------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "login") {
      loginUser(formData.email, formData.password);
    } else {
      createUser(formData.email, formData.password, formData.name);
    }
  };

  // ------------------ TOGGLE ------------------
  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setErrors({});
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  // ------------------ UI ------------------
  return (
    <div className="login-page">
      <motion.div
        className="login-box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          key={mode}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </motion.h2>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === "register" && (
            <>
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleChange} />
              {errors.name && <p className="error">{errors.name}</p>}
            </>
          )}

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Password</label>
          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="password-input"
            />
            <button type="button" className="eye-btn" onClick={togglePassword}>
              <i
                className={`far ${
                  showPassword ? "fa-eye" : "fa-eye-slash"
                }`}
              ></i>
            </button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          {mode === "register" && (
            <>
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="password-input"
                />
                <button type="button" className="eye-btn" onClick={togglePassword}>
                  <i
                    className={`far ${
                      showPassword ? "fa-eye" : "fa-eye-slash"
                    }`}
                  ></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </>
          )}

          {errors.submit && (
            <p className="error submit-error">{errors.submit}</p>
          )}

          <button
            className={`submit-btn ${
              mode === "register" ? "register-btn" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="toggle-text">
          {mode === "login" ? "Don't have an account?" : "Already have one?"}{" "}
          <span onClick={toggleMode} className="toggle-link">
            {mode === "login" ? "Register" : "Login"}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
