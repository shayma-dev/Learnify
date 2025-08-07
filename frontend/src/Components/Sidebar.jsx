/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import '@mantine/core/styles.css';
import './Sidebar.css'
import {FaTachometerAlt, FaTasks, FaBullseye, FaCheckCircle, FaUsers, FaBookOpen,FaCog } from 'react-icons/fa';
import logo from '../assets/Logo.png'
import { useState } from 'react';
import {Group } from '@mantine/core';
import {IconLogout} from '@tabler/icons-react';
const data = [
  { link: '', label: 'Dashboard', icon: FaTachometerAlt },
  { link: '', label: 'Task Manager', icon: FaTasks },
  { link: '', label: 'Study Planner', icon: FaBookOpen },
  { link: '', label: 'Focus', icon: FaBullseye },
  { link: '', label: 'Habits', icon: FaCheckCircle },
  { link: '', label: 'Groups', icon: FaUsers },
  { link: '', label: 'Settings', icon: FaCog },
];

export default function Sidebar() {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
      <a
      className="link"
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
     >
      <item.icon className="linkIcon" stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
 <nav className="navbar">
      <div className="navbarMain">
        <Group className="header" justify="space-between">
          <img src={logo} />
        </Group>
        {links}
      </div>

      <div className="footer">
         <a href="#" className="link" onClick={(event) => event.preventDefault()}>
          <IconLogout className="linkIcon" stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}