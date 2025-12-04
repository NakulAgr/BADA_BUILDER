import React, { useState } from 'react';
import './Login.css';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword  } from 'firebase/auth';
import { auth } from "../firebase"

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (mode === 'register' && !formData.name.trim())
      newErrors.name = 'Name is required.';

    if (!formData.email)
      newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email.';

    if (!formData.phone)
      newErrors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = 'Phone number must be 10 digits.';

    if (!formData.password)
      newErrors.password = 'Password is required.';
    else if (formData.password.length < 6)
      newErrors.password = 'Password should be at least 6 characters.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // To Login for an existing User
  function loginUser(email, password) {
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      console.log("Logged In Successfully::", userCredential.user);
    })
    .catch((error) => {
      console.error("Login error:", error.message);
    });
  }

  // To Register a new User
  function createUser(email, password) {
    createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
      console.log("User Created Successfully:", userCredential.user);
    })
    .catch((error) => {
      console.error("Failed to create user. Error:", error.message);
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      if (mode === 'login') {
        console.log('Logging in...', formData);
        loginUser(formData.email, formData.password)
      } else {
        console.log('Registering...', formData);
        createUser(formData.email, formData.password)
      }
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
        <p>Please enter your details to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="10-digit number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <p className="error">{errors.phone}</p>}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit" className="submit-btn">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="toggle-text">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span onClick={toggleMode} className="toggle-link">
            {mode === 'login' ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;