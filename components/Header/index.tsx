import { Wrapper, Logo } from './styles'
import { Container } from '../../lib/helpers'
import RoundWidget from '../RoundWidget'
export default ({currentRound}) => (
  <Container>
    <Wrapper>
      <Logo src="/static/img/logo.svg" />
      <RoundWidget currentRound={currentRound} />
    </Wrapper>
  </Container>
)
