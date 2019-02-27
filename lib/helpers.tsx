import styled from '@emotion/styled'
import theme from './theme'

const breakpoints = [0, 600, 960, 1280, 1920]

export const mq = breakpoints.map(bp => `@media (min-width: ${bp}px)`)

export const Container = styled.div({
  maxWidth: `${breakpoints[2]}px`,
  margin: '0 auto',
  padding: '0 24px',
  width: '100%',
  [`@media (min-width: ${breakpoints[2] + theme.gutter * 2}px)`]: {
    padding: 0
  }
})

