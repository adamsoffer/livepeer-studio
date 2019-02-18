import { useRef, useState, useEffect } from 'react'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Button from '@material-ui/core/Button'
import styled from '@emotion/styled'
import { Container } from '../../lib/helpers'
import { Wrapper, Column, Heading, Subheading, Body } from './styles'

export const StyledRadioGroup: any = styled(RadioGroup)({
  '&&': {
    display: 'flex',
    flexDirection: 'row'
  }
})

export default () => {
  const [frequency, setFrequency] = useState('weekly')
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(event.target.value)
  }

  return (
    <Container>
      <Wrapper>
        <Column>
          <Heading>// Staking Digest</Heading>
          <Subheading>Stay Alert</Subheading>
          <Body>
            Sign up to receive a daily and weekly email digest with your earnings
            transcoder stats.
          </Body>
        </Column>
        <Column>
          <form action="/confirmEmail" method="post">
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                name="email"
                defaultValue="adam@soffer.space"
                placeholder="email"
              />
            </div>
            <div>
              <input
                type="text"
                name="delegatorAddress"
                defaultValue="0x22b544d19ffe43c6083327271d9f39020da30c65"
                placeholder="account"
              />
            </div>
            <FormControl>
              <FormLabel>Frequency</FormLabel>
              <StyledRadioGroup
                onChange={handleChange}
                aria-label="Frequency"
                name="frequency"
                value={frequency}>
                <FormControlLabel
                  value="weekly"
                  control={<Radio />}
                  label="Weekly"
                />
                <FormControlLabel
                  value="monthly"
                  control={<Radio />}
                  label="Monthly"
                />
              </StyledRadioGroup>
            </FormControl>
            <div>
              <Button type="submit">SIGN UP</Button>
            </div>
          </form>
        </Column>
      </Wrapper>
    </Container>
  )
}
