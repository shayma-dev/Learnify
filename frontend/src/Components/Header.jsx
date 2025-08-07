import React, { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import icon from '../assets/Logo.png';
import { Modal, Box, Center, Progress, Text, TextInput, Button, Checkbox, Group, Divider, PasswordInput, Grid } from '@mantine/core';
import { useDisclosure} from '@mantine/hooks';
import '@mantine/core/styles.css';
import axios from 'axios';
import './Header.css';
import { authService } from '../utils/API';
import { storage } from '../utils/storage';

export function PasswordRequirement({ meets, label }) {
  return (
    <Text component="div" c={meets ? 'teal' : 'red'} mt={5} size="sm">
      <Center inline>
        {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
}

export const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

export function getStrength(password) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

export default function Header() {
  const [isLogin, setIsLogin] = useState(true); 
  const [opened, { close, open }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const strength = getStrength(formData.password); // استخدم formData.password بدل value
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(formData.password)} />
  ));
  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        styles={{ section: { transitionDuration: '0ms' } }}
        value={
          formData.password.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
        }
        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        key={index}
        size={4}
      />
    ));

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const response = await authService.login(formData.email, formData.password);
        storage.set('token', response.data.token);
        if (formData.rememberMe) {
          localStorage.setItem('authToken', response.data.token);
        }
      } else {
        const response = await authService.register(formData);
        storage.set('token', response.data.token);
      }
      close();
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Grid>
        <Grid.Col span="auto">
          <img src={icon} className='logoImage' alt="Logo" />
        </Grid.Col>
        <Grid.Col span={6}></Grid.Col>
        <Grid.Col span="auto">
          <Button className='login' variant="default" onClick={open}>
            Log in       
          </Button>
        </Grid.Col>
      </Grid>

      <Modal 
        styles={{
          content: { backgroundColor: '#e8e8e9ff' },
          header: { backgroundColor: '#ecedeeff', borderBottom: '1px solid #e9ecef' }
        }}
        opened={opened}
        onClose={close}
        title={
          <Text fw={700} size="xl" style={{ color: '#0a1653', fontSize:'20px' }}>
            Log in / Sign in
          </Text>
        }
        centered size="md"
      >
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <Group grow>
              <TextInput
                name="firstName"
                label="First name"
                placeholder="Your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                mt="md"
              />
              <TextInput
                name="lastName"
                label="Last name"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                mt="md"
              />
            </Group>
          )}

          <TextInput
            name="email"
            label="Email"
            placeholder="Your email"
            required
            mt="md"
            value={formData.email}
            onChange={handleInputChange}
          />

          <PasswordInput
            name="password"
            label="Password"
            placeholder="Password"
            required
            mt="md"
            value={formData.password}
            onChange={handleInputChange}
          />

          {!isLogin && (
            <>
              <Group gap={5} grow mt="xs" mb="md">
                {bars}
              </Group>
              <PasswordRequirement label="Has at least 6 characters" meets={formData.password.length > 5} />
              {checks}
            </>
          )}

          {isLogin && (
            <Group justify="space-between" mt="lg">
              <Checkbox
                name="rememberMe"
                label="Remember me"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              <Text c="dimmed" size="sm">Forgot password?</Text>
            </Group>
          )}

          {error && (
            <Text c="red" size="sm" mt="sm">
              {error}
            </Text>
          )}

          <Button 
            fullWidth 
            mt="xl" 
            type="submit"
            loading={loading}
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        <Divider my="md" label="OR" labelPosition="center" />
        <Text ta="center" mt="md">
          {isLogin ? "Don't have an account? " : "Have an account? "}
          <Text 
            span 
            c="blue" 
            style={{ cursor: 'pointer' }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </Text>
        </Text>
      </Modal>
    </div>
  );
}