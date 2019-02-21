import { Wrapper, Logo } from './styles'
import { Container } from '../../lib/helpers'
import RoundWidget from '../RoundWidget'
export default () => (
  <Container>
    <Wrapper>
      <Logo src="/static/logo.svg" />
      <RoundWidget />
    </Wrapper>
  </Container>
)
