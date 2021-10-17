import React, { CSSProperties, useEffect, useState } from 'react';

interface JobFormProps extends Frontier.Job {
  onSubmit: (data: any) => any,
}

interface Steps {
  current: number,
  max: number
}

const initialSteps = (sections: Frontier.Section[]) => {
  const max = sections.length
  const steps: Steps = {
    current: 1,
    max
  }
  return steps
}

const JobFormStyle = {
  fontFamily: 'sans-serif',
  minWidth: 360,
  maxWidth: 640
}

const StepperContainerStyle = {
  background: 'white',
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem'
}

const StepperStepStyle = {
  padding: '0.5rem',
  width: 'max-content',
  borderRadius: '1rem',
  marginLeft: '1rem',
  color: 'inherit',
  fontSize: 'small'
}

const StepperProgressContainerStyle = {
  height: '0.5rem',
  backgroundColor: 'white'
}

const StepperProgressStyle = {
  height: '100%',
  width: '0%'
}

const ButtonsContainerStyle = {
  marginLeft: '1rem',
  marginRight: '1rem',
  paddingBottom: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.5rem'
}

const ButtonStyle = {
  height: '2rem',
  border: 'none',
  borderRadius: '0.5rem',
  color: 'white',
  flexGrow: 1,
  fontWeight: 900
}

function JobForm({ theme, sections, onSubmit }: JobFormProps) {
  const {
    background_color,
    text_color
  } = theme;

  const style = {
    ...JobFormStyle,
    backgroundColor: background_color,
    color: text_color
  }

  const [steps, setSteps] = useState(initialSteps(sections))

  useEffect(() => {
    // NOTE: This will reset steps if section definition changes.
    // Parent component should be careful not to mess up user's progress
    // by changing definitions.
    setSteps(initialSteps(sections))
  }, [sections])

  const handleNext = async () => {
    const { current, max } = steps;

    if (current < max) {
      // NOTE: Validation for last section is triggered by Submit
      const formElement = document.getElementById('job-form') as HTMLFormElement
      if (formElement == null) {
        throw new Error("Expected JobForm")
      }

      const sectionElement = formElement.querySelector("fieldset") as HTMLFieldSetElement
      if (sectionElement == null) {
        throw new Error("Expected at least one JobForm Section")
      }

      const inputElements = sectionElement.querySelectorAll("input")
      // NOTE: Changed compiler target to ES6 for this the following iteration:
      for (const element of inputElements) {
        if (element.checkValidity() === false) {
          element.reportValidity()
          return
        }
      }

      const next = current + 1
      setSteps({ ...steps, current: next })
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
    const data = serializeFormData(formData)

    onSubmit(data)
  }

  return (
    <form
      id="job-form"
      onSubmit={handleSubmit}
      style={style}
    >
      <div
        id="stepper-container"
        style={StepperContainerStyle}
      >
        <p style={{
          ...StepperStepStyle,
          backgroundColor: theme.secondary_color
        }}>
          Step {steps.current} of {steps.max}
        </p>
      </div>
      <div
        id="stepper-progress-container"
        style={StepperProgressContainerStyle}
      >
        <div
          id="stepper-proggress"
          style={{
            ...StepperProgressStyle,
            width: `${(steps.current * 100 / steps.max)}%`,
            backgroundColor: theme.primary_color
          }}
        >

        </div>
      </div>
      {
        sections.map((schema, index) => (
          <Section
            key={schema.id}
            schema={schema}
            theme={theme}
            style={{
              display: index + 1 === steps.current ? '' : 'none'
            }}
          />
        ))
      }
      <div
        id="buttons-container"
        style={ButtonsContainerStyle}
      >
        {
          steps.current === steps.max ? (
            <>
              {steps.max > 1 && <button
                id="previous"
                type="button"
                onClick={handlePrevious}
                style={{
                  ...ButtonStyle,
                  backgroundColor: theme.secondary_color
                }}
              >Previous</button>}
              <button
                type="submit"
                style={{
                  ...ButtonStyle,
                  backgroundColor: theme.primary_color
                }}
              >Submit</button>
            </>
          ) : (
            <button
              id="next"
              type="button"
              onClick={handleNext}
              style={{
                ...ButtonStyle,
                backgroundColor: theme.secondary_color
              }}
            >Next</button>
          )
        }
      </div>
    </form >
  )
}

// source: https://gomakethings.com/how-to-serialize-form-data-with-vanilla-js/
// XXX: Serialization produces the following results
// "multiselect" -> string, string[]
// "boolean" -> 'yes', 'no'
function serializeFormData(data: FormData) {
  let obj: any = {}
  for (let [key, value] of data.entries()) {
    if (obj[key] !== undefined) {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]]
      }
      obj[key].push(value)
    } else {
      obj[key] = value
    }
  }
  return obj
}

interface SectionProps {
  theme: Frontier.Theme;
  schema: Frontier.Section;
  style: CSSProperties;
}

const SectionStyle = {
  backgroundColor: 'white',
  margin: '1rem',
  marginBottm: '0.5rem',
  border: 'none',
  borderRadius: '0.5rem'
}

const SectionLegendStyle = {
  fontWeight: 900,
  fontSize: 'x-large',
  display: 'contents'
}

function Section({ schema, theme, style, }: SectionProps) {
  const {
    id,
    title,
    content
  } = schema;

  return (
    <fieldset
      id={id}
      style={{
        ...SectionStyle,
        ...style
      }}
    >
      <legend style={SectionLegendStyle}>{title}</legend>
      {content.map(elementSchema => (
        <Element key={elementSchema.id} schema={elementSchema} theme={theme} />
      ))}
    </fieldset>
  )
}

interface ElementProps {
  schema: Frontier.Element,
  theme: Frontier.Theme
}

const ElementContainerStyle = {
  display: 'flex',
  flexFlow: 'column',
  paddingTop: '0.5rem'
}

const ElementLabelStyle = {
  paddingBottom: '0.5rem',
  fontWeight: 600
}

function Element({ schema, theme }: ElementProps) {
  const {
    type
  } = schema;

  switch (type) {
    case 'boolean':
      return <BooleanElement schema={schema} theme={theme} />
    case 'textarea':
      return <TextAreaElement schema={schema} theme={theme} />
    case 'text':
      return <TextElement schema={schema} theme={theme} />
    case 'multichoice':
      return <MultiChoiceElement schema={schema} theme={theme} />
    default:
      throw new Error("Unknown JobForm Element type")
  }
}

function BooleanElement({ schema, theme }: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      required
    }
  } = schema;

  return (
    <div
      id={`${id}-container`}
      style={{
        ...ElementContainerStyle,
      }}
    >
      <label
        htmlFor={id}
        style={ElementLabelStyle}
      >
        {question_text}
      </label>
      <label style={{ paddingBottom: '0.5rem' }}>
        <input
          required={required}
          type="radio"
          name={id}
          value="yes"
          style={{
            accentColor: theme.primary_color
          }}
        />
        Yes
      </label>
      <label style={{ paddingBottom: '0.5rem' }}>
        <input
          required={required}
          type="radio"
          name={id}
          value="no"
          style={{
            accentColor: theme.primary_color
          }}
        />
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
      placeholder
    }
  } = schema;

  return (
    <div
      id={`${id}-container`}
      style={ElementContainerStyle}
    >
      <label
        htmlFor={id}
        style={ElementLabelStyle}
      >
        {question_text}
      </label>
      <textarea
        name={id}
        required={required}
        placeholder={placeholder}
        style={{
          resize: 'vertical',
          color: 'inherit',
          borderRadius: '0.5rem',
          fontSize: 'medium',
          padding: '0.3rem',
          fontFamily: 'sans-serif'
        }}
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
      step
    }
  } = schema;

  return (
    <div
      id={`${id}-container`}
      style={ElementContainerStyle}
    >
      <label
        htmlFor={id}
        style={ElementLabelStyle}
      >
        {question_text}
      </label>
      <input
        name={id}
        type={format}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        step={step}
        style={{
          color: 'inherit',
          borderRadius: '0.5rem',
          fontSize: 'medium',
          padding: '0.3rem'
        }}
      />
    </div>
  )
}

function MultiChoiceElement({ schema }: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      options
    }
  } = schema;

  return (
    <div
      id={`${id}-container`}
      style={ElementContainerStyle}
    >
      <label
        htmlFor={id}
        style={ElementLabelStyle}
      >
        {question_text}
      </label>
      <select
        name={id}
        multiple
        style={{
          width: '100%',
          color: 'inherit',
          borderRadius: '0.5rem',
          fontSize: 'medium',
          padding: '0.3rem'
        }}
      >
        {options?.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
  )
}

export default JobForm