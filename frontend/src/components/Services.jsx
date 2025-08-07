import React from 'react';
import { Card, Image, Text, Grid } from '@mantine/core';
import taskicon from '../assets/icons/tasks.gif';
import notesicon from '../assets/icons/notes.gif';
import habitsicon from '../assets/icons/habits.gif';
import groupicon from '../assets/icons/groups.gif';
import plannericon from '../assets/icons/studyplan.gif';
import focusicon from '../assets/icons/focus.gif';
import './Services.css';

export default function Services() {
  return (
    <div className="services">
      <h1>Unlock your learning potential &#x1F4DA;</h1>
      <p className="subtext">Everything you need all in one place &#x1F525;</p>
      <div style={{ resize: 'horizontal', overflow: 'hidden', maxWidth: '100%' }}>
        <Grid gutter="md" justify="center">  {/* Added gutter for spacing between cards */}
          <Grid.Col span={4}>
            <Card className="service-card" shadow="sm" padding="xl" component="a" href="#">
              <Card.Section>
                <Image src={taskicon} alt="Task Manager" />
              </Card.Section>
              <Text className="card-title" weight={500} size="lg" mt="md">
                Task Manager
              </Text>
              <Text className="card-text" mt="xs" color="dimmed" size="sm">
                Organize your daily tasks, set priorities, and track your progress with ease.
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card className="service-card" shadow="sm" padding="xl" component="a" href="#">
              <Card.Section>
                <Image src={focusicon} alt="Focus" />
              </Card.Section>
              <Text className="card-title" weight={500} size="lg" mt="md">
                Focus
              </Text>
              <Text className="card-text" mt="xs" color="dimmed" size="sm">
                Stay focused and minimize distractions with our powerful focus tools.
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card className="service-card" shadow="sm" padding="xl" component="a" href="#">
              <Card.Section>
                <Image src={notesicon} alt="Notes" />
              </Card.Section>
              <Text className="card-title" weight={500} size="lg" mt="md">
                Notes
              </Text>
              <Text className="card-text" mt="xs" color="dimmed" size="sm">
                Save, organize, and access your study notes and resources all in one place.
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card className="service-card" shadow="sm" padding="xl" component="a" href="#">
              <Card.Section>
                <Image src={plannericon} alt="Study Planner" />
              </Card.Section>
              <Text className="card-title" weight={500} size="lg" mt="md">
                Study Planner
              </Text>
              <Text className="card-text" mt="xs" color="dimmed" size="sm">
                Plan your study sessions smartly with a flexible and personalized schedule.
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card className="service-card" shadow="sm" padding="xl" component="a" href="#">
              <Card.Section>
                <Image src={habitsicon} alt="Habits" />
              </Card.Section>
              <Text className="card-title" weight={500} size="lg" mt="md">
                Habits
              </Text>
              <Text className="card-text" mt="xs" color="dimmed" size="sm">
                Build and maintain productive study habits with daily streak tracking.
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card className="service-card" shadow="sm" padding="xl" component="a" href="#">
              <Card.Section>
                <Image src={groupicon} alt="Groups" />
              </Card.Section>
              <Text className="card-title" weight={500} size="lg" mt="md">
                Groups
              </Text>
              <Text className="card-text" mt="xs" color="dimmed" size="sm">
                Connect with peers, share notes, and study together in virtual groups.
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}
