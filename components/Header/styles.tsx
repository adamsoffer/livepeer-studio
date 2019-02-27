import styled from '@emotion/styled'

export const Root = styled.div({
  position: 'absolute',
  left: 0,
  width: '100%',
  zIndex: 1
})

export const Wrapper = styled.header({
  paddingTop: 32,
  paddingBottom: 32,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
})

export const Logo = styled.img({
  width: 130,
  cursor: 'pointer'
})
