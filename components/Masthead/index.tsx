import { Container } from '../../lib/helpers'
import {
  Background,
  Wrapper,
  Column,
  Heading,
  Subheading,
  Body,
} from './styles'

export default () => {
  return (
    <Background>
      <Container>
        <Wrapper>
          <Column>
            <Heading>✧･ﾟ Livepeer Staking Alerts ･ﾟ✧</Heading>
            <Subheading>Get Notified</Subheading>
            <Body>
              Sign up to receive email alerts with your earnings and keep tabs
              on how your transcoder is performing.
            </Body>
          </Column>
        </Wrapper>
      </Container>
    </Background>
  )
}
