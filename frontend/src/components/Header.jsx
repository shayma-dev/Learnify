import React from 'react';
import { Button, Grid, Modal, Text, TextInput, PasswordInput, Group, Divider, Checkbox, Progress, Center, Box } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import icon from '../assets/Logo.png';
import './Header.css';


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



export default function Header({ openModal }) {
  return (
    <Grid>
      <Grid.Col span="auto">
        <img src={icon} className="logoImage" alt="Logo" />
      </Grid.Col>
      <Grid.Col span={6}></Grid.Col>
      <Grid.Col span="auto">
        <Button className="login" variant="default" onClick={openModal}>
          Log in
        </Button>
      </Grid.Col>
    </Grid>
  );
}