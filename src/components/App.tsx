import React from 'react';
import formInstructions from '../data/form_instructions.json';
import JobForm from './JobForm'

function App() {
  const job = formInstructions as Frontier.Job;

  // Check your console to see the full instructions!
  console.log(job);

  return (
    <div>
      <img src="https://frontier-public-assets.s3-us-west-2.amazonaws.com/frontier-corona-logo.svg" alt="Frontier Logo" />
      <h1>👋 Hello from Team Frontier!</h1>
      <p>Good luck with the exercise. If you have any questions please email Jason: jason@frontier.jobs</p>
      <JobForm job={job} />
    </div>
  );
}

export default App;
