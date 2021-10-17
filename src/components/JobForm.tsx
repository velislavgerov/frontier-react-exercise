import React, { CSSProperties, useEffect, useState } from 'react';

interface JobFormProps {
  job: Frontier.Job,
  onSubmit?: (data: any) => any,
}

interface Steps {
  current: number,
  max: number,
}

const initialSteps = (job: Frontier.Job) => {
  const max = job.sections.length
  const steps: Steps = {
    current: 1,
    max,
  }
  return steps
}

function JobForm({ job, onSubmit }: JobFormProps) {
  const [steps, setSteps] = useState(initialSteps(job))

  useEffect(() => {
    // NOTE: This will reset steps if job definition changes.
    // Parent component should be careful not to mess up user's progress
    // by changing definitions.
    setSteps(initialSteps(job))
  }, [job])

  const handleNext = async () => {
    const { current, max } = steps;

    if (current < max) {
      // NOTE: Validation for last section is triggered by Submit
      const formElement = document.getElementById('job-form') as HTMLFormElement
      if (formElement == null) {
        throw new Error("Expected JobForm")
      }

      // XXX: checkValidity does not work properly on all browsers.
      // TODO: More elaborate validation needs to be implemented in between steps/sections
      const sectionElement = formElement[current] as HTMLFieldSetElement
      if (sectionElement.checkValidity() === true) {
        const next = current + 1
        setSteps({ ...steps, current: next })
      } else {
        sectionElement.reportValidity()
      }
    } else {
      throw new Error("Already at the last step")
    }
  }

  const handlePrevious = async () => {
    const { current } = steps;

    if (current > 1) {
      const previous = current - 1
      setSteps({ ...steps, current: previous })
    } else {
      throw new Error("Already at the first step")
    }
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    if (onSubmit !== undefined) onSubmit(data)
  }

  return (
    <form id="job-form" onSubmit={handleSubmit}>
      <h1>Step {steps.current} of {steps.max}</h1>
      {job.sections.map((schema, index) => (
        <Section
          key={schema.id}
          schema={schema}
          style={{
            display: index + 1 === steps.current ? '' : 'none'
          }}
        />
      ))}
      {steps.current === steps.max ? (
        <>
          {steps.max > 1 && <button type="button" onClick={handlePrevious}>Previous</button>}
          <button type="submit">Submit</button>
        </>
      ) : (
        <button type="button" onClick={handleNext}>Next</button>
      )}
    </form >
  )
}

interface SectionProps {
  schema: Frontier.Section,
  style: CSSProperties,
}

function Section({ schema, style }: SectionProps) {
  const {
    id,
    title,
    content
  } = schema;

  return (
    <fieldset id={id} style={style}>
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
      <input required={required} type="radio" name={id} value="yes" />
      Yes
      <input required={required} type="radio" name={id} value="no" />
      No
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
        {options?.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
  )
}

export default JobForm