import React, { createRef, CSSProperties, ReactNode, RefObject, useEffect, useReducer, useRef, useState } from 'react'
import SelectComponent, { MultiValue } from 'react-select'

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

type ElementValue = BooleanElementValue | TextAreaElementValue | TextElementValue | MultiChoiceElementValue | undefined

type TextAreaElementValue = string
type BooleanElementValue = boolean
type TextElementValue = string
type MultiChoiceElementValue = string[]

type JobFormData = {
  [sectionId: string]: {
    [elementId: string]: ElementValue
  }
}

interface JobFormControlledProps extends Frontier.Job {
  onSubmit: (data: JobFormData) => void,
}

interface State {
  data: JobFormData;
  currentStep: number;
  maxSteps: number;
  sectionRefs: RefObject<HTMLFieldSetElement>[]
}

interface StateActions {
  type: 'NEXT_STEP' | 'PREVIOUS_STEP' | 'UPDATE_DATA' | 'RESET' | 'SHOW_ERRORS';
  section?: Frontier.Section;
  element?: Frontier.Element;
  value?: ElementValue;
  sections?: Frontier.Section[];
}

const initialState = (sections: Frontier.Section[]) => {
  let state: State = {
    data: {},
    currentStep: 1,
    maxSteps: sections.length,
    sectionRefs: sections.map(() => createRef())
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
        throw new Error('A section is required')
      }

      if (element === undefined) {
        throw new Error('An element is required')
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
    data,
    sectionRefs
  } = state

  useEffect(() => {
    // NOTE: This will reset steps if section definition changes.
    // Parent component should be careful not to mess up user's progress
    // by changing definitions.
    dispatch({ type: 'RESET', sections })

  }, [sections])

  const handleNext = () => {
    const sectionElement = sectionRefs[currentStep - 1].current
    if (sectionElement == null) {
      throw new Error("Expected at least one JobFormControlled Section")
    }

    const inputElements = sectionElement.querySelectorAll("input")
    let firstInvalidEl = null
    for (const element of inputElements) {
      if (element.checkValidity() === false) {
        element.reportValidity()
        if (firstInvalidEl == null) firstInvalidEl = element
      }
    }

    if (firstInvalidEl) {
      firstInvalidEl.focus()
    } else {
      dispatch({ type: 'NEXT_STEP' })
    }
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
          ref={sectionRefs[index]}
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

const Section = React.forwardRef(({ id, title, style, children }: SectionProps, ref) => {
  return (
    <fieldset
      id={id}
      ref={ref as RefObject<HTMLFieldSetElement>}
      style={{
        ...SectionStyle,
        ...style
      }}
    >
      <legend style={SectionLegendStyle}>{title}</legend>
      {children}
    </fieldset>
  )
})

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
  value: ElementValue;
  onChange: (value: ElementValue) => void;
  theme: Frontier.Theme;
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
    value,
    onChange,
    theme
  } = props

  const inputRef = useRef<HTMLInputElement>(null)
  const { Error, checkValidity } = useElementValidation(inputRef, value, 'Please select your answer')

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
        gridTemplateRows: 'auto auto auto',
        gap: '0 0.5rem',
        gridTemplateAreas: '"Label Label" "Yes No" "Error Error"'
      }}
    >
      <label
        htmlFor={id}
        style={{
          ...ElementLabelStyle,
          gridArea: 'Label'
        }}
      >
        {question_text} {required && <RequiredMark />}
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
          ref={inputRef}
          required={required}
          type="radio"
          name={id}
          value="yes"
          style={{
            appearance: 'none',
          }}
          onChange={handleChange}
          onBlur={checkValidity}
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
          onBlur={checkValidity}
          onInvalid={(e) => e.preventDefault()}
        />
        No
      </label>
      {Error}
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
    value,
    onChange
  } = props

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const { Error, checkValidity } = useElementValidation(textAreaRef, value, 'Please enter your answer')

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
        {question_text} {required && <RequiredMark />}
      </label>
      <textarea
        ref={textAreaRef}
        name={id}
        required={required}
        aria-required={required ? 'true' : 'false'}
        aria-invalid={Error ? 'true' : 'false'}
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
        onBlur={checkValidity}
      />
      {Error}
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
    value,
    onChange
  } = props

  const inputRef = useRef<HTMLInputElement>(null)
  const { Error, checkValidity } = useElementValidation(inputRef, value, `Please enter a valid ${format}`)

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
        {question_text} {required && <RequiredMark />}
      </label>
      <input
        ref={inputRef}
        name={id}
        type={format}
        required={required}
        aria-required={required ? 'true' : 'false'}
        aria-invalid={Error ? 'true' : 'false'}
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
        onBlur={checkValidity}
      />
      {Error}
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
    value,
    onChange
  } = props

  const inputRef = useRef<HTMLInputElement>(null)
  const { Error, checkValidity } = useElementValidation(inputRef, value, 'Please select your answers')

  const getValue = () => value !== undefined ? value as MultiChoiceElementValue : ''

  const handleChange = (newValue: MultiValue<{ label: string; value: string; }>) => {
    const newValues = newValue.map(value => value.label)
    onChange(newValues)
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
        {question_text} {required && <RequiredMark />}
      </label>
      <SelectComponent
        isMulti
        options={options}
        onChange={handleChange}
        onBlur={checkValidity}
      />
      <input
        name={id}
        ref={inputRef}
        aria-required={required ? 'true' : 'false'}
        aria-invalid={Error ? 'true' : 'false'}
        tabIndex={-1}
        autoComplete="off"
        style={{
          opacity: 0,
          width: "100%",
          height: 0,
        }}
        value={getValue()}
        onChange={() => { }}
        required={required}
      />
      {Error}
    </div>
  )
}

function useElementValidation(ref: RefObject<HTMLInputElement | HTMLTextAreaElement>, value: ElementValue, message: string) {
  const [error, setError] = useState<string | null>(null)
  const invalidEventListener = useRef<(event: Event) => void>()

  const checkValidity = () => {
    const inputEl = ref.current as HTMLInputElement
    if (inputEl.checkValidity() === false) {
      inputEl.reportValidity()
    }
  }

  useEffect(() => {
    const inputEl = ref.current as HTMLInputElement
    if (inputEl.checkValidity() === true) {
      setError(null)
    }
  }, [value, ref])

  useEffect(() => {
    const inputEl = ref.current as HTMLInputElement
    invalidEventListener.current = (event: Event) => {
      event.preventDefault()

      setError(message)
    }
    inputEl.addEventListener('invalid', invalidEventListener.current);
    return () => {
      if (invalidEventListener.current) {
        inputEl.removeEventListener('invalid', invalidEventListener.current)
      }
    }
  }, [ref, message])

  const Error = error != null && <span
    style={{
      color: '#ef4444',
      paddingTop: '0.5rem',
      gridArea: 'Error'
    }}
  >
    {error}
  </span>

  return {
    Error,
    checkValidity
  }
}

function RequiredMark() {
  return <sup style={{ color: '#ef4444' }}>*</sup>
}

export default JobFormControlled