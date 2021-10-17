import React from 'react';

interface JobFormProps {
  job: Frontier.Job
}

function JobForm({ job }: JobFormProps) {
  const handleSubmit = (event: any) => {
    event.preventDefault();

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {job.sections.map(schema => (
        <Section key={schema.id} schema={schema} />
      ))}
      <button type="submit">Submit</button>
    </form>
  )
}

interface SectionProps {
  schema: Frontier.Section
}

function Section({ schema }: SectionProps) {
  const {
    id,
    title,
    content
  } = schema;

  return (
    <fieldset id={id}>
      <legend>{title}</legend>
      {content.map(elementSchema => (
        <Element key={elementSchema.id} schema={elementSchema} />
      ))}
    </fieldset>
  )
}

interface ElementProps {
  schema: Frontier.Element
}

function Element({ schema }: ElementProps) {
  const {
    type
  } = schema;

  switch (type) {
    case 'boolean':
      return <BooleanElement schema={schema} />
    case 'textarea':
      return <TextAreaElement schema={schema} />
    case 'text':
      return <TextElement schema={schema} />
    case 'multichoice':
      return <MultiChoiceElement schema={schema} />
    default:
      throw new Error("Unknown JobForm Element type")
  }
}

function BooleanElement({ schema }: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      required
    },
  } = schema;

  return (
    <div id={`${id}-container`}>
      <label htmlFor={id}>{question_text}</label>
      <label>
        <input required={required} type="radio" name={id} value="yes" />
        Yes
      </label>
      <label>
        <input required={required} type="radio" name={id} value="no" />
        No
      </label>
    </div>
  )
}

function TextAreaElement({ schema }: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      required,
      placeholder,
    },
  } = schema;

  return (
    <div id={`${id}-container`}>
      <label htmlFor={id}>{question_text}</label>
      <textarea
        name={id}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}

function TextElement({ schema }: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      required,
      placeholder,
      format,
      pattern,
      step,
    },
  } = schema;

  return (
    <div id={`${id}-container`}>
      <label htmlFor={id}>{question_text}</label>
      <input
        name={id}
        type={format}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        step={step}
      />
    </div>
  )
}

function MultiChoiceElement({ schema }: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      options,
    },
  } = schema;

  return (
    <div id={`${id}-container`}>
      <label htmlFor={id}>{question_text}</label>
      <select
        name={id}
        multiple
      >
        {options?.map(({ value, label }) => <option value={value}>{label}</option>)}
      </select>
    </div>
  )
}

export default JobForm