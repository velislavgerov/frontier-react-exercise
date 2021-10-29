import formInstructions from '../data/form_instructions.json';
import JobForm from './JobForm';
import { render, fireEvent, screen, act } from '@testing-library/react';

test('JobForm produces expected output', async () => {
  const expectedData = {
    fullname: 'Velislav Danielov Gerov',
    email: 'velislav.gerov@gmail.com',
    age: 'yes',
    languages: 'English',
    workspace: 'no',
    experience: '...',
    hours_on_project: '6',
  };
  const { theme, sections } = formInstructions as Frontier.Job;
  const handleSubmit = (data: typeof expectedData) =>
    expect(data).toEqual(expectedData);
  const result = render(
    <JobForm theme={theme} sections={sections} onSubmit={handleSubmit} />,
  );

  const fullname = result.container.querySelector(
    '[name=fullname]',
  ) as HTMLInputElement;
  const email = result.container.querySelector(
    '[name=email]',
  ) as HTMLInputElement;
  const age = result.container.querySelector(
    `[name=age][value=${expectedData.age}]`,
  ) as HTMLInputElement;

  fireEvent.change(fullname, { target: { value: expectedData.fullname } });
  expect(fullname.value).toBe(expectedData.fullname);

  fireEvent.change(email, { target: { value: expectedData.email } });
  expect(email.value).toBe(expectedData.email);

  fireEvent.click(age);
  expect(age.value).toBe(expectedData.age);

  const nextBtn = screen.getByText('Next') as HTMLButtonElement;

  await act(async () => {
    fireEvent.click(nextBtn);
  });

  const languages = result.container.querySelector(
    '[name=languages]',
  ) as HTMLInputElement;
  const workspace = result.container.querySelector(
    `[name=workspace][value=${expectedData.workspace}]`,
  ) as HTMLInputElement;
  const experience = result.container.querySelector(
    '[name=experience]',
  ) as HTMLInputElement;
  const hours_on_project = result.container.querySelector(
    '[name=hours_on_project]',
  ) as HTMLInputElement;

  fireEvent.change(languages, { target: { value: expectedData.languages } });
  expect(languages.value).toBe(expectedData.languages);

  fireEvent.click(workspace);
  expect(workspace.value).toBe(expectedData.workspace);

  fireEvent.change(experience, { target: { value: expectedData.experience } });
  expect(experience.value).toBe(expectedData.experience);

  fireEvent.change(hours_on_project, {
    target: { value: expectedData.hours_on_project },
  });
  expect(hours_on_project.value).toBe(expectedData.hours_on_project);

  const submitBtn = screen.getByText('Submit') as HTMLButtonElement;
  fireEvent.click(submitBtn);
});
