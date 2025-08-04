import React, { useState } from 'react';
import authService from '../api/authService'; // Adjust your import path accordingly
import { useUser } from '../context/UserContext'; // Adjust your import path accordingly
import { useNavigate } from 'react-router-dom';

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(false);
  const [opened, setOpened] = useState(false);
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    confirm: ''
  });
  const { setUser } = useUser(); // Use UserContext
  const navigate = useNavigate();

  const handleOpen = () => setOpened(true);
  const handleClose = () => setOpened(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { email, password, username } = formValues;
    try {
      const userData = await authService.signup(email, password, username);
      setUser(userData);
      handleClose();
      console.log('Registration successful:', userData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formValues;
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      handleClose();
      console.log('Login successful:', userData);
      navigate('/profile'); // Redirect to the profile page or desired page
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleOpen}>Open Auth Modal</button>

      {opened && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2>{isLogin ? "Login" : "Create an account"}</h2>
            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <div>
                  <label>Username:</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Your username"
                    value={formValues.username}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              )}
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formValues.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formValues.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {!isLogin && (
                <div>
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    name="confirm"
                    placeholder="Confirm password"
                    value={formValues.confirm}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div style={buttonGroupStyle}>
                <button type="button" onClick={() => setIsLogin((prev) => !prev)}>
                  {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </button>
                <button type="submit">
                  {isLogin ? "Login" : "Register"}
                </button>
              </div>
            </form>
            <button onClick={handleClose} style={closeButtonStyle}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple styles for modal
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '4px',
  maxWidth: '400px',
  width: '100%',
};

const buttonGroupStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '10px',
};

const closeButtonStyle = {
  marginTop: '10px',
  backgroundColor: 'red',
  color: 'white',
  border: 'none',
  padding: '5px 10px',
  cursor: 'pointer',
};