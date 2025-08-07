/* eslint-disable jsx-a11y/alt-text */
import smallogo from '../assets/smallLogo.png'
import React, { useState } from 'react'
import './FirstSection.css'
import { IconCheck, IconX } from '@tabler/icons-react';
import { Modal, Box, Center, Progress, Text, TextInput, Button, Checkbox, Group, Divider, PasswordInput, Grid } from '@mantine/core';
import { useDisclosure, useInputState } from '@mantine/hooks';
import '@mantine/core/styles.css';

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

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

export default function FirstSection() {
  const [isLogin, setIsLogin] = useState(true); 
  const [opened, { close, open }] = useDisclosure(false);
  const [value, setValue] = useInputState('');
  const strength = getStrength(value);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
  ));
  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        styles={{ section: { transitionDuration: '0ms' } }}
        value={
          value.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
        }
        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        key={index}
        size={4}
      />
    ));

  return (
    <div className="first-section">
        <img src={smallogo}/>
        <h1>Learn, track 
          and achieve</h1>
        <h6>Streamline your study routine and reach your goals</h6>
         <Button className="getstart" variant="default" onClick={open}>Get Started</Button>
        <>
      <Modal 
      styles={{
          content: {
            backgroundColor: '#e8e8e9ff', 
          },
          header: {
            backgroundColor: '#ecedeeff', 
            borderBottom: '1px solid #e9ecef'
          }
        }}
        opened={opened}
        onClose={close}
        title={
          <Text 
            fw={700} 
            size="xl" 
            style={{ 
              color: '#0a1653',
              fontSize:'20px',
            }}
          >
            Log in / Sign in
          </Text>
        }
        centered size="md">
        {isLogin ? (
          // Log in to user account
          <>
            <TextInput
              label="Email"
              placeholder="Your email"
              required
              mt="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Password"
              required
              mt="md"
            />
            <Group justify="space-between" mt="lg">
              <Checkbox label="Remember me" />
              <Text c="dimmed" size="sm">Forgot password?</Text>
            </Group>
            <Button fullWidth mt="xl" onClick={close}>
              Login
            </Button>
            <Divider my="md" label="OR" labelPosition="center" />
            <Text ta="center" mt="md">
              Don't have an account?{' '}
              <Text span c="blue" style={{ cursor: 'pointer' }} onClick={() => setIsLogin(false)}>
                Register
              </Text>
            </Text>
          </>
        ) : (
          // Creating a new account
          <>
            <Group grow>
              <TextInput
                label="First name"
                placeholder="Your first name"
                mt="md"
              />
              <TextInput
                label="Last name"
                placeholder="Your last name"
                mt="md"
              />
            </Group>
            <TextInput
              label="Email"
              placeholder="Your email"
              required
              mt="md"
            />
            <PasswordInput
              value={value}
              onChange={setValue}
              placeholder="Your password"
              label="Password"
              required
            />

            <Group gap={5} grow mt="xs" mb="md">
              {bars}
            </Group>

            <PasswordRequirement label="Has at least 6 characters" meets={value.length > 5} />
            {checks}
         
            <Button fullWidth mt="xl" onClick={close}>
              Register
            </Button>
            <Divider my="md" label="OR" labelPosition="center" />
            <Text ta="center" mt="md">
              Have an account?{' '}
              <Text span c="blue" style={{ cursor: 'pointer' }} onClick={() => setIsLogin(true)}>
                Login
              </Text>
            </Text>
          </>
        )}
      </Modal>

     
    </>
    </div>
  )
}
