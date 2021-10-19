import React from 'react';
import formInstructions from '../data/form_instructions.json';
import JobForm from './JobForm';
import JobFormControlled from './JobFormControlled'

function App() {
  const job = formInstructions as Frontier.Job;

  // Check your console to see the full instructions!
  console.log(job);

  return (
    <div>
      <img src="https://frontier-public-assets.s3-us-west-2.amazonaws.com/frontier-corona-logo.svg" alt="Frontier Logo" />
      <h1>👋 Hello from Team Frontier!</h1>
      <p>Good luck with the exercise. If you have any questions please email Jason: jason@frontier.jobs</p>
      <h1>👋 Hello from Velislav!</h1>
      <p>Thank you for the wishes and for the opportunity to work on this exerciece. Below, you will find the result of my work followed by a self-report.</p>
      <h2>Result</h2>
      <JobFormControlled
        theme={job.theme}
        sections={job.sections}
        onSubmit={(data) => console.log(data)}
      />
      <h2>Self-report</h2>
      <h3>Time</h3>
      <p>I spent about a total of 16 hours working on the exercise - 8 hours on creating an uncontrolled component and 8 hours on another iteration as I was not happy with the usability of the first component. I checked out a git branch called <em>solution</em> to be used as referece for my progress. The following table breaks down the timing and tasks:</p>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Task</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1h</td>
            <td>Problem definition, running the code, a basic form</td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>1h</td>
            <td>Completed the basic form</td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>2h</td>
            <td>Completed the stepper and form validation</td>
            <td>Struggled a bit with getting the validation working. Need to get more familiar with browser APIs.</td>
          </tr>
          <tr>
            <td>2.5h</td>
            <td>Completed the styles</td>
            <td>I am used to using ui components but desided to go "bare-bones" for the exercise. Definitely have to get faster and better with CSS.</td>
          </tr>
          <tr>
            <td>.5h</td>
            <td>Fixes</td>
            <td>I should have started with the test.</td>
          </tr>
          <tr>
            <td>1h</td>
            <td>Added a test</td>
            <td>Had to research <em>@testing-library/react</em> on the go as I was not familiar with it. Will definitely do more testing in the future.</td>
          </tr>
          <tr>
            <td>3h</td>
            <td>Added JobFromControlled component with better composition and data types</td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>1h</td>
            <td>Added react-select</td>
            <td>I was not happy with the native multiselect and decided to substitute it.</td>
          </tr>
          <tr>
            <td>3h</td>
            <td>Controlled validation</td>
            <td>N/A</td>
          </tr>
        </tbody>
      </table>
      <h3>JobForm (Uncontrolled)</h3>
      <h4>Solution</h4>
      <ul>
        <li>Tried to address all of the requirements in the exercise description without bringing in any additional packages</li>
        <li>Decided to implement an uncontrolled form and let the HTMLFormElement handle data and validation for the sake of simplicity and performance</li>
        <li>I was not sure if the sections description could change in runtime (it probaby shouldn't) but implemented re-render if the secions object changes</li>
        <li>Decided to return serialized FormData through a prop handler but I was not sure about the schema of output data. As a result:
          <ul>
            <li>Boolean fields map to the string values "yes" and "no"</li>
            <li>Multichoice can be a string or an array of strings (depending on the selection)</li>
            <li>It was probaby better to just return the FormData or even the Submit Event and handle it externally since serialization was not a requirement"</li>
          </ul>
        </li>
      </ul>
      <h4>Limitations</h4>
      <ul>
        <li>Styles are not too flexible (and pretty) and the form is fixed</li>
        <li>Did not go into full-depth with styling. I.e. Boolean fields render as Yes/No radio buttons</li>
        <li>Uncertanties about the type of the output data</li>
        <li>No extensive test</li>
      </ul>
      <h3>JobFormControlled</h3>
      <h4>Solution</h4>
      <ul>
        <li>Better composition</li>
        <li>Has validation messeges</li>
      </ul>
      <h4>Limitations</h4>
      <ul>
        <li>Inline styles</li>
        <li>Depends on react-select</li>
        <li>Does not focus first invalid input on submit</li>
      </ul>
      <h3>Thoughts</h3>
      <p>I liked the excerice but I was a bit rusty and should work on my performance. Despite that I didn't find the requirements too challenging as the description for the exercise was very clear.</p>
      <p>Can't wait to hear your feedback and thoughs! Thanks!</p>
    </div >
  );
}

export default App;
