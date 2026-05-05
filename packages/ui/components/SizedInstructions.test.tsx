import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SizedInstructions } from './SizedInstructions'

describe('SizedInstructions', () => {
  it('renders an empty pre when text is empty', () => {
    const { container } = render(<SizedInstructions text="" sizeIndex={0} />)
    const pre = container.querySelector('pre')
    expect(pre).toBeInTheDocument()
    expect(pre?.textContent).toBe('')
  })

  it('renders plain text without annotations when no brackets are present', () => {
    const { container } = render(
      <SizedInstructions text="Knit 16 rows in g st." sizeIndex={0} />,
    )
    expect(container.textContent).toBe('Knit 16 rows in g st.')
    expect(container.querySelector('.bg-hi-bg')).toBeNull()
    expect(container.querySelector('.bg-adj-bg')).toBeNull()
  })

  it('highlights the chosen size and dims the others in highlight mode', () => {
    const { container } = render(
      <SizedInstructions
        text="Cast on 106 [112: 118: 124: 130] sts"
        sizeIndex={2}
        mode="highlight"
      />,
    )
    const highlighted = container.querySelector('.bg-hi-bg')
    expect(highlighted).toBeInTheDocument()
    expect(highlighted?.textContent).toBe('118')

    const dimmed = container.querySelector('.opacity-40')
    expect(dimmed?.textContent).toContain('106')
    expect(dimmed?.textContent).toContain('112')
    expect(dimmed?.textContent).toContain('124')
    expect(dimmed?.textContent).toContain('130')
    expect(dimmed?.textContent).not.toContain('118')
  })

  it('shows only the chosen size in strip mode', () => {
    const { container } = render(
      <SizedInstructions
        text="Cast on 106 [112: 118: 124: 130] sts"
        sizeIndex={0}
        mode="strip"
      />,
    )
    expect(container.querySelector('.bg-hi-bg')?.textContent).toBe('106')
    expect(container.querySelector('.opacity-40')).toBeNull()
    expect(container.textContent).toMatch(/^Cast on 106 sts$/)
  })

  it('renders adjusted values with the adj tone and an asterisk marker', () => {
    const { container } = render(
      <SizedInstructions
        text="Cast on 106 [112: 118] sts"
        sizeIndex={0}
        mode="strip"
        adjustments={{ '106 [112: 118]': '96 [102: 108]' }}
      />,
    )
    const adjusted = container.querySelector('.bg-adj-bg')
    expect(adjusted?.textContent).toBe('96 [102: 108]')
    expect(container.querySelector('.bg-hi-bg')).toBeNull()
    expect(container.querySelector('.align-super')?.textContent).toBe('*')
  })

  it('falls back to the hi tone when no adjustment matches the bracket', () => {
    const { container } = render(
      <SizedInstructions
        text="Cast on 106 [112: 118] sts"
        sizeIndex={0}
        mode="strip"
        adjustments={{ 'unrelated bracket': 'some other value' }}
      />,
    )
    expect(container.querySelector('.bg-hi-bg')?.textContent).toBe('106')
    expect(container.querySelector('.bg-adj-bg')).toBeNull()
    expect(container.querySelector('.align-super')).toBeNull()
  })

  it('clamps a sizeIndex past the bracket length to the last value', () => {
    const { container } = render(
      <SizedInstructions text="Cast on 80 [82: 84] sts" sizeIndex={9} mode="strip" />,
    )
    expect(container.querySelector('.bg-hi-bg')?.textContent).toBe('84')
  })
})
