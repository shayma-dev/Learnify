import React from 'react'
import Card from 'react-bootstrap/Card';

import taskicon from '../assets/icons/tasks.gif'
import notesicon from '../assets/icons/notes.gif'
import habitsicon from '../assets/icons/habits.gif'
import groupicon from '../assets/icons/groups.gif'
import plannericon from '../assets/icons/studyplan.gif'
import focusicon from '../assets/icons/focus.gif'
import './Services.css'
import {Button} from 'react-bootstrap';
import { SimpleGrid } from '@mantine/core';


export default function Services() {
  return (
     <div className="services">
       <h1>Unlock your learning potential &#x1F4DA;</h1>
        <p className="subtext">every thing you need all in one place &#x1F525;</p>
 <div style={{ resize: 'horizontal', overflow: 'hidden', maxWidth: '100%' }}>
      <SimpleGrid cols={3} verticalSpacing="lg">
        {/* Card 1 */}
        <div>
          <Card className="service-card" style={{ width: '18rem' }}>
            <Card.Body>
              <img src={taskicon} alt="Task Manager" />
              <Card.Title className="card-title">Task Manager</Card.Title>
              <Card.Text className="card-text">
                Organize your daily tasks, set priorities, and track your progress with ease.
              </Card.Text>
              <Button className="learnmore">Learn more &#x27A1;&#xFE0F;</Button>
            </Card.Body>
          </Card>
        </div>

        {/* Card 2 */}
        <div>
          <Card className="service-card" style={{ width: '18rem' }}>
            <Card.Body>
              <img src={focusicon} alt="Focus" />
              <Card.Title className="card-title">Focus</Card.Title>
              <Card.Text className="card-text">
                Connect with peers, share notes, and study together in virtual groups.
              </Card.Text>
              <Button className="learnmore">Learn more &#x27A1;&#xFE0F;</Button>
            </Card.Body>
          </Card>
        </div>

        {/* Card 3 */}
        <div>
          <Card className="service-card" style={{ width: '18rem' }}>
            <Card.Body>
              <img src={notesicon} alt="Notes" />
              <Card.Title className="card-title">Notes</Card.Title>
              <Card.Text className="card-text">
                Save, organize, and access your study notes and resources all in one place.
              </Card.Text>
              <Button className="learnmore">Learn more &#x27A1;&#xFE0F;</Button>
            </Card.Body>
          </Card>
        </div>

        {/* Card 4 */}
        <div>
          <Card className="service-card" style={{ width: '18rem' }}>
            <Card.Body>
              <img src={plannericon} alt="Study Planner" />
              <Card.Title className="card-title">Study Planner</Card.Title>
              <Card.Text className="card-text">
                Plan your study sessions smartly with a flexible and personalized schedule.
              </Card.Text>
              <Button className="learnmore">Learn more &#x27A1;&#xFE0F;</Button>
            </Card.Body>
          </Card>
        </div>

        {/* Card 5 */}
        <div>
          <Card className="service-card" style={{ width: '18rem' }}>
            <Card.Body>
              <img src={habitsicon} alt="Habits" />
              <Card.Title className="card-title">Habits</Card.Title>
              <Card.Text className="card-text">
                Build and maintain productive study habits with daily streak tracking.
              </Card.Text>
              <Button className="learnmore">Learn more &#x27A1;&#xFE0F;</Button>
            </Card.Body>
          </Card>
        </div>

        {/* Card 6 */}
        <div>
          <Card className="service-card" style={{ width: '18rem' }}>
            <Card.Body>
              <img src={groupicon} alt="Groups" />
              <Card.Title className="card-title">Groups</Card.Title>
              <Card.Text className="card-text">
                Connect with peers, share notes, and study together in virtual groups.
              </Card.Text>
              <Button className="learnmore">Learn more &#x27A1;&#xFE0F;</Button>
            </Card.Body>
          </Card>
        </div>
      </SimpleGrid>
    </div>
    </div>
    
  );
}
