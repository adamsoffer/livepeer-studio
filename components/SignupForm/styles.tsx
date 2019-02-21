import styled from '@emotion/styled'

export const Background = styled.div({
  backgroundColor: 'rgba(34, 34, 34, .95)',
  position: 'relative',
  height: '100vh',
  '::after': {
    position: 'absolute',
    zIndex: -1,
    left: 0,
    top: 0,
    width: '100%',
    content: '""',
    backgroundImage: 'url(/static/ocean.jpg)',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    height: '100vh'
  }
})

export const Wrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 80,
  width: '100%'
})

export const Column = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '50%',
  maxWidth: 450
})

export const Heading = styled.h1({
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16
})

export const Subheading = styled.h2({
  fontSize: 56,
  marginBottom: 16
})

export const Body = styled.p({
  fontSize: 16,
  fontFamily: "'IBM Plex Mono', monospace",
  letterSpacing: '0',
  lineHeight: '30px',
  maxWidth: 448
})

export const Form = styled.form({})
