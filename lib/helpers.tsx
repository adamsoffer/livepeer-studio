import styled from '@emotion/styled'
import theme from './theme'

export const mq = theme.breakpoints.map(bp => `@media (min-width: ${bp}px)`)

export const Container = styled.div({
  maxWidth: `${theme.breakpoints[2]}px`,
  margin: '0 auto',
  padding: '0 24px',
  [`@media (min-width: ${theme.breakpoints[2] + theme.gutter * 2}px)`]: {
    padding: 0
  }
})

