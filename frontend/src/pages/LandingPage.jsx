import React, { useState } from 'react';
import { Modal, Text, TextInput, PasswordInput, Button, Divider, Group, Progress, Checkbox, Center, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconX } from '@tabler/icons-react';
import Header from '../components/Header';
import FirstSection from '../components/FirstSection';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Services from '../components/Services.jsx';
import Footer from '../components/Footer.jsx';

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function PasswordRequirement({ meets, label }) {
  return (
    <Text component="div" c={meets ? 'teal' : 'red'} mt={5} size="sm">
      <Center inline>
        {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
}

function getStrength(password) {
  let multiplier = password.length > 5 ? 0 : 1;
  requirements.forEach((req) => {
    if (!req.re.test(password)) multiplier += 1;
  });
  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const { login, signup, user } = useAuth();

  const strength = getStrength(password);
  const checks = requirements.map((req, i) => (
    <PasswordRequirement key={i} label={req.label} meets={req.re.test(password)} />
  ));
  const bars = Array(4)
    .fill(0)
    .map((_, i) => (
      <Progress
        key={i}
        styles={{ section: { transitionDuration: '0ms' } }}
        value={password.length > 0 && i === 0 ? 100 : strength >= ((i + 1) / 4) * 100 ? 100 : 0}
        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        size={4}
      />
    ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, username);
      }
      setRedirect(true);
      close();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (redirect || user) {
    return <Navigate to="/profile" />;
  }

  return (
    <>
      <Header openModal={open} />
      <FirstSection openModal={open} />
      <Modal 
      opened={opened}
       onClose={close} 
       title="Log in / Sign in" 
       centered size="md"
       >

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <TextInput
              name="username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              mt="md"
            />
          )}
          <TextInput
            name="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mt="md"
          />
          <PasswordInput
            name="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mt="md"
          />
          {!isLogin && (
            <>
              <Group gap={5} grow mt="xs" mb="md">{bars}</Group>
              {checks}
            </>
          )}
          {isLogin && (
            <Group justify="space-between" mt="lg">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            </Group>
          )}
          {errorMessage && <Text c="red" size="sm" mt="sm">{errorMessage}</Text>}
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>
        <Divider my="md" label="OR" labelPosition="center" />
        <Text ta="center" mt="md">
          {isLogin ? "Don't have an account?" : "Have an account?"}
          <Text span c="blue" style={{ cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </Text>
        </Text>
      </Modal>
      <Services/>
        <Footer/>
    </>
  );
}