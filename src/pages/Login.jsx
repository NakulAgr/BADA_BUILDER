import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle, User, Mail, Lock, ArrowRight } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { performanceMonitor } from "../utils/performance";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const getRedirectPath = (isRegistration = false) => {
    if (isRegistration) return "/";
    return from === "/login" ? "/" : from;
  };

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState('form');

  const resetForm = useCallback(() => {
    setMode("login");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
    setLoading(false);
    setRegistrationStep('form');
  }, []);

  useEffect(() => {
    if (location.state?.resetForm) {
      resetForm();
      setErrors({ submit: "Form has been reset. Please enter your credentials." });
      setTimeout(() => setErrors({}), 2000);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, resetForm, navigate, location.pathname]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [errors]);

  const validate = useMemo(() => {
    return () => {
      const newErrors = {};
      if (mode === "register" && !formData.name.trim()) newErrors.name = "Name is required.";
      if (!formData.email) newErrors.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email.";
      if (!formData.password) newErrors.password = "Password is required.";
      else if (formData.password.length < 6) newErrors.password = "Password should be at least 6 characters.";
      if (mode === "register") {
        if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  }, [mode, formData]);

  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    setErrors({});
    try {
      await performanceMonitor.trackNetworkRequest('Login', signInWithEmailAndPassword(auth, email, password));
      navigate(getRedirectPath(false), { replace: true });
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

  const createUser = useCallback(async (email, password, name) => {
    setLoading(true);
    setErrors({});
    setRegistrationStep('creating');
    try {
      const userCredential = await performanceMonitor.trackNetworkRequest(
        'Registration',
        createUserWithEmailAndPassword(auth, email, password)
      );
      const userProfilePromise = performanceMonitor.trackNetworkRequest(
        'Profile Creation',
        setDoc(doc(db, "users", userCredential.user.uid), {
          email, name, is_subscribed: false, subscription_expiry: null, created_at: new Date().toISOString(),
        })
      );
      setRegistrationStep('success');
      await signOut(auth);
      setTimeout(() => {
        setRegistrationStep('transitioning');
        setLoading(true);
      }, 800);
      setTimeout(() => {
        setMode('login');
        setRegistrationStep('form');
        setLoading(false);
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
        setErrors({ submit: "Registration successful! Please login with your credentials." });
      }, 1200);
      userProfilePromise.catch((profileError) => console.warn('Profile creation delayed:', profileError));
    } catch (error) {
      setRegistrationStep('form');
      setLoading(false);
      let msg = "Registration failed";
      if (error.code === "auth/email-already-in-use") msg = "Email already registered";
      else if (error.code === "auth/weak-password") msg = "Password is too weak";
      else if (error.code === "auth/network-request-failed") msg = "Network error. Please check your connection";
      setErrors({ submit: msg });
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;
    if (mode === "login") loginUser(formData.email, formData.password);
    else createUser(formData.email, formData.password, formData.name);
  }, [mode, formData, validate, loginUser, createUser, loading]);

  const toggleMode = useCallback(() => {
    if (registrationStep === 'transitioning') return;
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRegistrationStep('form');
    setLoading(false);
  }, [registrationStep]);

  const isDisabled = loading || registrationStep === 'transitioning';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Loading Overlay */}
      <AnimatePresence>
        {(loading && registrationStep !== 'success') || registrationStep === 'transitioning' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
              <p className="text-gray-700 text-lg">
                {registrationStep === 'transitioning' ? "Switching to login..." :
                 mode === "login" ? "Signing you in..." :
                 registrationStep === 'creating' ? "Creating your account..." : "Processing..."}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          {/* Header */}
          <motion.div key={mode} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500">
              {mode === "login" ? "Sign in to continue" : "Join us today"}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Register only) */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="Enter your name"
                      className="pl-10 bg-gray-50 border-gray-200"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isDisabled}
                  placeholder="Enter your email"
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isDisabled}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-gray-50 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isDisabled}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password (Register only) */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 bg-gray-50 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isDisabled}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error/Success Messages */}
            {errors.submit && (
              <Alert variant={errors.submit.includes('successful') ? 'default' : 'destructive'} className={cn(
                errors.submit.includes('successful') && "bg-green-50 border-green-200 text-green-700"
              )}>
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Success Step */}
            {mode === "register" && registrationStep === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-700 text-sm">Registration successful! Redirecting to login...</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isDisabled || (mode === "register" && (registrationStep === 'success' || registrationStep === 'transitioning'))}
              className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800 rounded-full"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="mt-6 text-center text-gray-500 text-sm">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={isDisabled ? undefined : toggleMode}
              disabled={isDisabled}
              className="text-gray-900 hover:underline font-medium"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
