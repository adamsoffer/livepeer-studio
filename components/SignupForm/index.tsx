import { useState } from 'react'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Layout from '../Layout'
import styled from '@emotion/styled'
import { Container } from '../../lib/helpers'
import {
  Background,
  Form,
  Wrapper,
  Column,
  Heading,
  Subheading,
  Body
} from './styles'

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
    <Background>
      <Layout>
        <Container>
          <Wrapper>
            <Column>
              <Heading>✧･ﾟ Livepeer Token Alerts ･ﾟ✧</Heading>
              <Subheading>Get Notified</Subheading>
              <Body>
                Sign up to receive email alerts with your earnings and keep tabs
                on how your transcoder is performing.
              </Body>
            </Column>
            <Column>
              <Form action="/confirmEmail" method="post">
                <TextField
                  id="email"
                  required
                  label="My email address is"
                  name="email"
                  placeholder="email"
                  fullWidth
                  InputLabelProps={{
                    shrink: true
                  }}
                />
                <TextField
                  id="address"
                  required
                  label="My bonded address is"
                  name="delegatorAddress"
                  placeholder="e.g. 0x4bbeEB066eD09..."
                  fullWidth
                  InputLabelProps={{
                    shrink: true
                  }}
                />
                <FormControl>
                  <FormLabel>Email me</FormLabel>
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
                  <Button type="submit" variant="contained" color="primary">SIGN UP</Button>
                </div>
              </Form>
            </Column>
          </Wrapper>
        </Container>
      </Layout>
    </Background>
  )
}
