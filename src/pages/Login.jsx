import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import "./Login.css";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { performanceMonitor } from "../utils/performance";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const returnTo = location.state?.returnTo;
  const property = location.state?.property;
  const message = location.state?.message;

  // For registration, always redirect to home page, not back to login
  const getRedirectPath = (isRegistration = false) => {
    if (isRegistration) {
      return "/"; // Always go to home after registration
    }

    // If coming from BookSiteVisit, redirect back with property data
    if (returnTo && returnTo.includes('/book-visit')) {
      return {
        path: '/book-visit',
        state: { property }
      };
    }

    return from === "/login" ? "/" : from; // Don't redirect back to login page
  };

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "", // Added phone number
  });

  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  // otpMethod state removed - defaulting to email

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form', 'otp', 'creating', 'success', 'transitioning'

  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);

  // ------------------ RESET FORM FUNCTION ------------------
  const resetForm = useCallback(() => {
    setMode("login");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    });
    setOtp("");
    setShowOtpInput(false);
    setShowResetPasswordForm(false);
    setTimer(0);
    setCanResend(true);
    setErrors({});
    setLoading(false);
    setRegistrationStep('form');
  }, []);

  // ------------------ TIMER LOGIC ------------------
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // ------------------ HANDLE HEADER LOGIN CLICK ------------------
  useEffect(() => {
    // Check if user clicked login from header while already on login page
    if (location.state?.resetForm) {
      resetForm();
      // Show brief reset confirmation
      setErrors({ submit: "Form has been reset. Please enter your credentials." });
      setTimeout(() => {
        setErrors({});
      }, 2000); // Reduced from 3000ms to 2000ms
      // Clear the state to prevent repeated resets
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, resetForm, navigate, location.pathname]);

  // ------------------ HANDLE INPUT ------------------
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Validate phone number input (only digits)
    if (name === 'phoneNumber' && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific errors immediately
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // ------------------ VALIDATION ------------------
  const validate = useMemo(() => {
    return () => {
      const newErrors = {};

      if (mode === "register") {
        if (!formData.name.trim()) {
          newErrors.name = "Name is required.";
        }

        if (!formData.phoneNumber) {
          newErrors.phoneNumber = "Phone Number is required.";
        } else if (formData.phoneNumber.length !== 10) {
          newErrors.phoneNumber = "Enter a valid 10-digit phone number.";
        }
      }

      if (!formData.email) {
        newErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Enter a valid email.";
      }

      if (mode !== "forgot-password" || showResetPasswordForm) {
        if (!formData.password) {
          newErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password should be at least 6 characters.";
        }
      }

      if (mode === "register" || (mode === "forgot-password" && showResetPasswordForm)) {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password.";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match.";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  }, [mode, formData]);

  // ------------------ OTP API FUNCTIONS ------------------
  const sendOtp = async () => {
    setLoading(true);
    setErrors({});

    // Always use email for OTP
    const identifier = formData.email;
    const otpMethod = 'email';

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: otpMethod,
          identifier: identifier
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      // Success
      setShowOtpInput(true);
      setRegistrationStep('otp');
      setTimer(30); // Start 30s timer
      setCanResend(false);

      const sentTo = formData.email;
      setErrors({ submit: `OTP sent successfully to ${sentTo}` });

    } catch (error) {
      console.error("Send OTP error:", error);
      let msg = error.message || "Failed to send OTP. Please try again.";
      if (msg === "Failed to fetch") {
        msg = "Backend server not reachable. Please run 'npm run server' in a separate terminal.";
      }
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 4) {
      setErrors({ otp: "Please enter a valid 4-digit OTP" });
      return;
    }

    setLoading(true);
    setErrors({});

    // Always use email for verification
    const identifier = formData.email;

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,
          otp: otp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Success - Proceed to User Creation
      createUser(formData.email, formData.password, formData.name, formData.phoneNumber);

    } catch (error) {
      console.error("Verify OTP error:", error);
      setErrors({ otp: error.message || "Invalid OTP. Please try again." });
      setLoading(false);
    }
  };

  // ------------------ LOGIN ------------------
  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    setErrors({});

    try {
      await performanceMonitor.trackNetworkRequest(
        'Login',
        signInWithEmailAndPassword(auth, email, password)
      );

      // Navigate immediately after auth success - don't wait for context updates
      const redirectInfo = getRedirectPath(false);

      if (typeof redirectInfo === 'object' && redirectInfo.path) {
        // Special redirect with state (like BookSiteVisit with property data)
        navigate(redirectInfo.path, {
          state: redirectInfo.state,
          replace: true
        });
      } else {
        // Normal redirect
        navigate(redirectInfo, { replace: true });
      }
    } catch (error) {
      let msg = "Login failed";
      if (error.code === "auth/user-not-found") msg = "User not found";
      if (error.code === "auth/wrong-password") msg = "Wrong password";
      if (error.code === "auth/invalid-credential") msg = "Invalid email or password";
      if (error.code === "auth/too-many-requests") msg = "Too many attempts. Try again later";
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  }, [navigate, getRedirectPath]);

  // ------------------ REGISTER ------------------
  const createUser = useCallback(async (email, password, name, phoneNumber) => {
    setLoading(true);
    setErrors({});
    setRegistrationStep('creating');

    try {
      // Step 1: Create user account (fast)
      const userCredential = await performanceMonitor.trackNetworkRequest(
        'Registration',
        createUserWithEmailAndPassword(auth, email, password)
      );

      // Step 2: Create user profile in background (non-blocking)
      const userProfilePromise = performanceMonitor.trackNetworkRequest(
        'Profile Creation',
        setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          name,
          phone: phoneNumber, // Add phone number to profile
          is_subscribed: false,
          subscription_expiry: null,
          created_at: new Date().toISOString(),
        })
      );

      // Step 3: Show success message briefly, then transition
      setRegistrationStep('success');

      // Sign out the user immediately after registration (no auto-login)
      await signOut(auth);

      // Show success message briefly, then start transition
      setTimeout(() => {
        setRegistrationStep('transitioning');
        setLoading(true); // Keep loading overlay during transition
      }, 800); // Reduced from 1500ms to 800ms

      // Complete transition to login mode
      setTimeout(() => {
        setMode('login');
        setRegistrationStep('form');
        setShowOtpInput(false); // Reset OTP view
        setOtp("");
        setLoading(false); // Remove loading overlay after UI transition is complete
        setFormData({ name: "", email: "", password: "", confirmPassword: "", phoneNumber: "" });
        setErrors({ submit: "Registration successful! Please login with your credentials." });
      }, 1200); // Reduced from 2000ms to 1200ms

      // Handle profile creation in background
      userProfilePromise.catch((profileError) => {
        console.warn('Profile creation delayed:', profileError);
        // Profile creation failed, but user registration was successful
        // Profile will be created on first login via AuthContext
      });

    } catch (error) {
      setRegistrationStep('form'); // Note: If error happens AFTER OTP, we might want to stay on OTP? 
      // Actually if Create User fails (e.g. email exists), we should probably go back to form.
      // But OTP was used. Ideally we check email existence before OTP, but Fireauth checks on Create.
      // For now, going back to form is safe. Resending OTP might be needed if they retry.
      setLoading(false);
      let msg = "Registration failed";
      if (error.code === "auth/email-already-in-use") {
        msg = "Email already registered";
      } else if (error.code === "auth/weak-password") {
        msg = "Password is too weak";
      } else if (error.code === "auth/network-request-failed") {
        msg = "Network error. Please check your connection";
      }
      setErrors({ submit: msg });
    }
  }, []);

  // ------------------ RESET PASSWORD API ------------------
  const handleResetPassword = async () => {
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
          newPassword: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Success - Show Success Overlay
      setRegistrationStep('reset_success');

      // Navigate to login after delay with smooth transition
      setTimeout(() => {
        setRegistrationStep('transitioning');

        // Final transition to login form
        setTimeout(() => {
          resetForm();
        }, 800);
      }, 1500);

    } catch (error) {
      console.error("Reset Password error:", error);
      setErrors({ submit: error.message });
      setLoading(false); // Only disable loading on error
    }
  };

  const verifyOtpForReset = async () => {
    if (otp.length !== 4) {
      setErrors({ otp: "Please enter a valid 4-digit OTP" });
      return;
    }
    // Just show the password fields locally, actual verification happens on final submit 
    // OR we can verify first to give immediate feedback. 
    // Let's verify first using the existing verify endpoint to check OTP validity.

    setLoading(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.email, otp: otp, checkOnly: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid OTP');

      // OTP is valid
      setShowResetPasswordForm(true);
      setShowOtpInput(false);
    } catch (error) {
      setErrors({ otp: error.message || "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };


  // ------------------ SUBMIT ------------------
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Prevent submission if already loading
    if (loading) return;

    if (!validate()) return;

    if (mode === "login") {
      loginUser(formData.email, formData.password);
    } else if (mode === "register") {
      if (showOtpInput) {
        verifyOtp();
      } else {
        sendOtp();
      }
    } else if (mode === "forgot-password") {
      if (showResetPasswordForm) {
        handleResetPassword();
      } else if (showOtpInput) {
        verifyOtpForReset();
      } else {
        sendOtp();
      }
    }
  }, [mode, formData, validate, loginUser, showOtpInput, showResetPasswordForm, otp, verifyOtp, sendOtp, loading]);

  // ------------------ TOGGLE ------------------
  const toggleMode = useCallback(() => {
    if (registrationStep === 'transitioning') return;
    setMode((prev) => (prev === "login" ? "register" : "login"));
    // Reset form data/state logic...
    setFormData({ name: "", email: "", password: "", confirmPassword: "", phoneNumber: "" });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRegistrationStep('form');
    setShowOtpInput(false);
    setShowResetPasswordForm(false);
    setOtp("");
    setLoading(false);
  }, [registrationStep]);

  const switchToForgotPassword = () => {
    resetForm();
    setMode("forgot-password");
  };

  // ------------------ UI ------------------
  return (
    <div className="login-page">
      {/* Loading Overlay ... */}
      {(loading && registrationStep !== 'success') || registrationStep === 'transitioning' || registrationStep === 'reset_success' ? (
        <motion.div className="fullscreen-loading-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <p className="loading-text">
              {registrationStep === 'transitioning' ? "Switching..." :
                registrationStep === 'reset_success' ? "Password Reset Successful!" :
                  mode === "login" ? "Signing you in..." :
                    mode === "forgot-password" ? "Processing..." :
                      "Processing..."}
            </p>
          </div>
        </motion.div>
      ) : null}

      <motion.div className="login-box" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <motion.h2 key={mode} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          {mode === "login" ? "login" : mode === "register" ? "Create Account" : "Reset Password"}
        </motion.h2>

        {message && <motion.div className="redirect-message" /* ... styles */>{message}</motion.div>}

        <form onSubmit={handleSubmit} className={`login-form ${loading ? 'form-disabled' : ''}`}>

          {/* OTP Input UI (Shared for Register & Forgot Password) */}
          {showOtpInput ? (
            <div className="otp-container" style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '20px', fontSize: '15px', color: '#555' }}>
                Enter the 4-digit code sent to <br /><strong>{formData.email}</strong>
              </p>
              <input type="text" value={otp} onChange={(e) => { if (/^\d{0,4}$/.test(e.target.value)) setOtp(e.target.value); setErrors(p => ({ ...p, otp: "" })); }} placeholder="0000" style={{ textAlign: 'center', letterSpacing: '10px', fontSize: '24px', fontWeight: 'bold', maxWidth: '200px', margin: '0 auto', display: 'block' }} maxLength={4} autoFocus disabled={loading} />
              {errors.otp && <p className="error" style={{ textAlign: 'center', marginTop: '10px' }}>{errors.otp}</p>}

              <div style={{ marginTop: '20px', fontSize: '14px' }}>
                <p>{canResend ? <button type="button" onClick={sendOtp} className="toggle-link" style={{ background: 'none', border: 'none', padding: 0 }} disabled={loading}>Resend OTP</button> : <span style={{ color: '#888' }}>Resend in {timer}s</span>}</p>
                <button type="button" onClick={() => { setShowOtpInput(false); }} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', marginTop: '10px', cursor: 'pointer', fontSize: '13px' }}>Change Email</button>
              </div>
            </div>
          ) : showResetPasswordForm ? (
            /* New Password Form for Forgot Password */
            <>
              <label>New Password</label>
              <div className="password-wrapper">
                <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="password-input" disabled={loading} placeholder="Minimum 6 characters" />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)}><i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} /></button>
              </div>
              {errors.password && <p className="error">{errors.password}</p>}

              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} className="password-input" disabled={loading} />
                <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(p => !p)}><i className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`} /></button>
              </div>
              {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            </>
          ) : (
            /* Regular Form */
            <>
              {mode === "register" && (
                <>
                  <label>Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} disabled={loading} />
                  {errors.name && <p className="error">{errors.name}</p>}

                  <label>Phone Number</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="9876543210" maxLength={10} disabled={loading} />
                  {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}
                </>
              )}

              <label>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} disabled={loading} />
              {errors.email && <p className="error">{errors.email}</p>}

              {(mode === "login" || mode === "register") && (
                <>
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="password-input" disabled={loading} />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)} disabled={loading}><i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} /></button>
                  </div>
                  {errors.password && <p className="error">{errors.password}</p>}
                </>
              )}

              {mode === "register" && (
                <>
                  <label>Confirm Password</label>
                  <div className="password-wrapper">
                    <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} className="password-input" disabled={loading} />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(p => !p)} disabled={loading}><i className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`} /></button>
                  </div>
                  {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
                </>
              )}

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: "5px" }}>
                  <span onClick={switchToForgotPassword} className="toggle-link" style={{ fontSize: "12px" }}>Forgot Password?</span>
                </div>
              )}
            </>
          )}

          {errors.submit && (
            <p className={`error submit-error ${errors.submit.includes('successfully') ? 'success-login' : ''}`}>
              {errors.submit}
            </p>
          )}

          {/* Buttons */}
          <button className="submit-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> :
              mode === "register" ? (showOtpInput ? "Verify OTP" : "Register") :
                mode === "forgot-password" ? (showOtpInput ? "Verify & Continue" : showResetPasswordForm ? "Reset Password" : "Send OTP") :
                  "Login"}
          </button>

        </form>

        <p className="toggle-text">
          {mode === "login" ? "Don't have an account?" : mode === "register" ? "Already have one?" : "Back to"} {" "}
          <span onClick={toggleMode} className={`toggle-link ${loading ? 'disabled' : ''}`}>
            {mode === "login" ? "Register" : "Login"}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
