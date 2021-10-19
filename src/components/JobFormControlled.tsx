import React, { CSSProperties, ReactNode, useEffect, useReducer } from 'react'

const JobFormControlledStyle = {
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
  border: 'none',
  borderRadius: '0.5rem',
  color: 'white',
  flexGrow: 1,
  fontWeight: 900,
  padding: '1rem'
}

interface JobFormControlledProps extends Frontier.Job {
  onSubmit: (data: any) => any,
}

type ElementValue = BooleanElementValue | TextAreaElementValue | TextElementValue | MultiChoiceElementValue | undefined

type TextAreaElementValue = string
type BooleanElementValue = boolean
type TextElementValue = string
type MultiChoiceElementValue = string[]

interface State {
  data: {
    [sectionId: string]: {
      [elementId: string]: ElementValue
    }
  };
  currentStep: number;
  maxSteps: number;
}
const initialState = (sections: Frontier.Section[]) => {
  let state: State = {
    data: {},
    currentStep: 1,
    maxSteps: sections.length
  }

  for (const section of sections) {
    state.data[section.id] = {}
    state.data[section.id] = {}
    for (const element of section.content) {
      state.data[section.id][element.id] = undefined
    }
  }

  return state
}

const checkElementValidity = (element: Frontier.Element) => false
const checkSectionValidity = (section: Frontier.Section) => false

interface StateActions {
  type: 'NEXT_STEP' | 'PREVIOUS_STEP' | 'UPDATE_DATA' | 'RESET';
  section?: Frontier.Section;
  element?: Frontier.Element;
  value?: ElementValue;
  sections?: Frontier.Section[];
}

function stateReducer(state: State, action: StateActions) {
  switch (action.type) {
    case 'NEXT_STEP': {
      if (state.currentStep === state.maxSteps) {
        throw new Error("There is no next step")
      }

      const nextState = Object.assign({}, state, {
        currentStep: state.currentStep + 1
      })

      return nextState
    }
    case 'PREVIOUS_STEP': {
      if (state.currentStep <= 1) {
        throw new Error("There is no previous step")
      }

      const nextState = Object.assign({}, state, {
        currentStep: state.currentStep - 1
      })

      return nextState
    }
    case 'UPDATE_DATA': {
      const { section, element, value } = action

      if (section === undefined) {
        throw new Error('Section is required')
      }

      if (element === undefined) {
        throw new Error('Element is required')
      }

      const nextState = Object.assign({}, state, {
        data: Object.assign({}, state.data, {
          [section.id]: Object.assign({}, state.data[section.id], {
            [element.id]: value
          })
        })
      })

      return nextState
    }
    case 'RESET': {
      const { sections } = action

      if (sections === undefined) {
        throw new Error('Sections are required')
      }

      return initialState(sections)
    }
    default:
      throw new Error("Unrecognized action")
  }
}

function JobFormControlled({ theme, sections, onSubmit }: JobFormControlledProps) {
  const {
    background_color,
    text_color
  } = theme

  const style = {
    ...JobFormControlledStyle,
    backgroundColor: background_color,
    color: text_color
  }

  const [state, dispatch] = useReducer(stateReducer, initialState(sections))

  const {
    currentStep,
    maxSteps,
    data
  } = state

  useEffect(() => {
    // NOTE: This will reset steps if section definition changes.
    // Parent component should be careful not to mess up user's progress
    // by changing definitions.
    dispatch({ type: 'RESET', sections })

  }, [sections])

  const handleNext = () => {
    // NOTE: Validation for last section is triggered by Submit
    const formElement = document.getElementById('job-form') as HTMLFormElement
    if (formElement == null) {
      throw new Error("Expected JobFormControlled")
    }

    const sectionElement = formElement.querySelector("fieldset") as HTMLFieldSetElement
    if (sectionElement == null) {
      throw new Error("Expected at least one JobFormControlled Section")
    }

    const inputElements = sectionElement.querySelectorAll("input")
    // NOTE: Changed compiler target to ES6 for the following iteration:
    for (const element of inputElements) {
      if (element.checkValidity() === false) {
        element.reportValidity()
        return
      }
    }

    dispatch({ type: 'NEXT_STEP' })
  }

  const handlePrevious = () => dispatch({ type: 'PREVIOUS_STEP' })

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    onSubmit(data)
  }

  return (
    <form
      id="job-form"
      onSubmit={handleSubmit}
      style={style}
    >
      <Stepper theme={theme} currentStep={currentStep} maxSteps={maxSteps} />
      {sections.map((section, index) => (
        <Section
          id={section.id}
          key={section.id}
          title={section.title}
          theme={theme}
          style={{ display: index + 1 === currentStep ? '' : 'none' }}
        >
          {section.content.map(element => (
            <Element
              id={element.id}
              key={element.id}
              question_text={element.question_text}
              metadata={element.metadata}
              type={element.type}
              theme={theme}
              onChange={(value) => dispatch({
                type: 'UPDATE_DATA',
                section,
                element,
                value
              })}
              value={state.data[section.id][element.id]}
            />
          ))}
        </Section>
      ))}
      <Buttons
        currentStep={currentStep}
        maxSteps={maxSteps}
        onNext={handleNext}
        onPrevous={handlePrevious}
        theme={theme}
      />
    </form >
  )
}

interface StepperProps {
  currentStep: number;
  maxSteps: number;
  theme: Frontier.Theme;
}

function Stepper({ currentStep, maxSteps, theme }: StepperProps) {
  return (
    <>
      <div
        id="stepper-container"
        style={StepperContainerStyle}
      >
        <p style={{
          ...StepperStepStyle,
          backgroundColor: theme.secondary_color
        }}>
          Step {currentStep} of {maxSteps}
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
            width: `${(currentStep * 100 / maxSteps)}%`,
            backgroundColor: theme.primary_color
          }}
        >
        </div>
      </div>
    </>
  )
}

interface ButtonProps {
  currentStep: number;
  maxSteps: number;
  onNext: (event: React.SyntheticEvent) => void;
  onPrevous: (event: React.SyntheticEvent) => void;
  theme: Frontier.Theme;
}

function Buttons(props: ButtonProps) {
  const {
    currentStep,
    maxSteps,
    onNext,
    onPrevous,
    theme
  } = props

  return (
    <div
      id="buttons-container"
      style={ButtonsContainerStyle}
    >
      {
        currentStep === maxSteps ? (
          <>
            {maxSteps > 1 && <button
              id="previous"
              type="button"
              onClick={onPrevous}
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
            onClick={onNext}
            style={{
              ...ButtonStyle,
              backgroundColor: theme.primary_color
            }}
          >Next</button>
        )
      }
    </div>
  )
}

interface SectionProps {
  id: Frontier.Section["id"];
  title: Frontier.Section["title"];
  theme: Frontier.Theme;
  style: CSSProperties;
  children?: ReactNode;
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

function Section({ id, title, style, children }: SectionProps) {
  return (
    <fieldset
      id={id}
      style={{
        ...SectionStyle,
        ...style
      }}
    >
      <legend style={SectionLegendStyle}>{title}</legend>
      {children}
    </fieldset>
  )
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

interface ElementProps extends Frontier.Element {
  theme: Frontier.Theme;
  onChange: (value: ElementValue) => void;
  value: ElementValue;
}

function Element(props: ElementProps) {
  const { type } = props

  switch (type) {
    case 'boolean':
      return <BooleanElement {...props} />
    case 'textarea':
      return <TextAreaElement {...props} />
    case 'text':
      return <TextElement {...props} />
    case 'multichoice':
      return <MultiChoiceElement {...props} />
    default:
      throw new Error("Unknown JobFormControlled Element type")
  }
}

function BooleanElement(props: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      required
    },
    theme,
    onChange,
    value
  } = props

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    if (target.value === 'yes') {
      onChange(true)
    } else if (target.value === 'no') {
      onChange(false)
    }
  }

  return (
    <div
      id={`${id}-container`}
      style={{
        ...ElementContainerStyle,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '0 0.5rem',
        gridTemplateAreas: '"Label Label" "Yes No"'
      }}
    >
      <label
        htmlFor={id}
        style={{
          ...ElementLabelStyle,
          gridArea: 'Label'
        }}
      >
        {question_text} {required && <sup>*</sup>}
      </label>
      <label style={{
        backgroundColor: value === true ? theme.primary_color : theme.secondary_color,
        borderRadius: '0.5rem',
        textAlign: 'center',
        padding: '0.5rem',
        color: 'white',
        fontWeight: 700,
        gridArea: 'Yes'
      }}>
        <input
          required={required}
          type="radio"
          name={id}
          value="yes"
          style={{
            appearance: 'none'
          }}
          onChange={handleChange}
        />
        Yes
      </label>
      <label style={{
        backgroundColor: value === false ? theme.primary_color : theme.secondary_color,
        borderRadius: '0.5rem',
        textAlign: 'center',
        padding: '0.5rem',
        color: 'white',
        fontWeight: 700,
        gridArea: 'No'
      }}>
        <input
          required={required}
          type="radio"
          name={id}
          value="no"
          style={{
            appearance: 'none'
          }}
          onChange={handleChange}
        />
        No
      </label>
    </div>
  )
}

function TextAreaElement(props: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      required,
      placeholder
    },
    onChange,
    value
  } = props

  const handleChange = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement
    onChange(target.value)
  }

  return (
    <div
      id={`${id}-container`}
      style={ElementContainerStyle}
    >
      <label
        htmlFor={id}
        style={ElementLabelStyle}
      >
        {question_text} {required && <sup>*</sup>}
      </label>
      <textarea
        name={id}
        required={required}
        placeholder={placeholder}
        style={{
          resize: 'none',
          color: 'inherit',
          borderRadius: '0.5rem',
          fontSize: 'medium',
          padding: '0.3rem',
          fontFamily: 'sans-serif'
        }}
        value={value !== undefined ? value as TextAreaElementValue : ''}
        onChange={handleChange}
      />
    </div>
  )
}

function TextElement(props: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      required,
      placeholder,
      format,
      pattern,
      step
    },
    onChange,
    value
  } = props

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    onChange(target.value)
  }

  return (
    <div
      id={`${id}-container`}
      style={ElementContainerStyle}
    >
      <label
        htmlFor={id}
        style={ElementLabelStyle}
      >
        {question_text} {required && <sup>*</sup>}
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
        value={value !== undefined ? value as TextElementValue : ''}
        onChange={handleChange}
      />
    </div>
  )
}

function MultiChoiceElement(props: ElementProps) {
  const {
    id,
    question_text,
    metadata: {
      required,
      options
    },
    onChange,
    value
  } = props

  const handleChange = (event: React.SyntheticEvent<HTMLSelectElement>) => {
    const target = event.target as HTMLSelectElement
    let values = value !== undefined ? [...value as MultiChoiceElementValue] : []
    const selected = values !== undefined ? values.includes(target.value) : false

    if (selected) {
      const index = values.indexOf(target.value);
      if (index > -1) {
        values.splice(index, 1);
      }
    } else {
      values.push(target.value)
    }

    onChange(values)
  }

  return (
    <div
      id={`${id}-container`}
      style={ElementContainerStyle}
    >
      <label
        htmlFor={id}
        style={ElementLabelStyle}
      >
        {question_text} {required && <sup>*</sup>}
      </label>
      <select
        name={id}
        required={required}
        multiple
        style={{
          width: '100%',
          color: 'inherit',
          borderRadius: '0.5rem',
          fontSize: 'medium',
          padding: '0.3rem'
        }}
        value={value !== undefined ? value as MultiChoiceElementValue : []}
        onChange={handleChange}
      >
        {options?.map(option => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        )
        )}
      </select>
    </div>
  )
}

export default JobFormControlled