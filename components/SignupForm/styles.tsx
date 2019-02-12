import styled from '@emotion/styled'

export const Wrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 100
})

export const Column = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '50%'
})

export const Heading = styled.h1({
  fontSize: 18,
  color: '#323232',
  fontWeight: 600
})

export const Subheading = styled.h2({
  fontSize: 54,
  color: '#323232'
})

export const Body = styled.p({
  fontSize: 16,
  color: '#323232',
  letterSpacing: '0',
  lineHeight: '30px',
  maxWidth: 448
})
