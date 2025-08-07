  import React from 'react';
import { TextInput, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { DateInput } from '@mantine/dates';
import '@mantine/core/styles.css';

export default function Tasks() {
  const [value, setValue] = useState(null); 
  return (
    <div>
   <Button className='add-task'
      onClick={() => {
        modals.open({
          title: 'Add a new task',
          children: (
            <>
              <TextInput 
              label="Task Name"
               data-autofocus />
              
          <DateInput valueFormat="YYYY MMM DD" label="Date input" placeholder="Date input" />
              <Button fullWidth 
              onClick={() => modals.closeAll()} 
              mt="md">
                Submit
              </Button>
            </>
          ),
        });
      }}
    >
        Add Task
    </Button>

    </div>
  )
}
