import { useForm, useField } from 'react-final-form-hooks'
import { useState } from 'react'
import * as Utils from 'web3-utils'
import Button from '@material-ui/core/Button'
import EmailValidator from 'email-validator'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import styled from '@emotion/styled'
import TextField from '@material-ui/core/TextField'
import axios from 'axios'
import { Container } from '../../lib/helpers'
import {
  Background,
  Form,
  Wrapper,
  Column,
  Heading,
  Subheading,
  Body,
  ButtonContainer,
  Label
} from './styles'

export const StyledRadioGroup: any = styled(RadioGroup)({
  '&&': {
    display: 'flex',
    flexDirection: 'row'
  }
})

const onSubmit = async values => {
  try {
    const response = await axios.post('/confirmEmail', {
      email: values.email,
      delegatorAddress: values.delegatorAddress.toLowerCase(),
      frequency: values.frequency
    })
    console.log(response)
  } catch (e) {
    console.log(e)
  }
}

const validate = values => {
  const errors: any = {}
  if (!values.email) {
    errors.email = 'Required'
  } else if (!EmailValidator.validate(values.email)) {
    errors.email = 'Invalid email address'
  }
  if (!values.delegatorAddress) {
    errors.delegatorAddress = 'Required'
  } else if (!Utils.isAddress(values.delegatorAddress)) {
    errors.delegatorAddress = 'Invalid Ethereum Address'
  }
  return errors
}

export default () => {
  const { form, handleSubmit, submitting } = useForm({
    onSubmit,
    validate,
    initialValues: {
      frequency: 'weekly'
    }
  })
  const email = useField('email', form)
  const delegatorAddress = useField('delegatorAddress', form)
  const frequency = useField('frequency', form)

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
          <Column>
            <Form noValidate onSubmit={handleSubmit}>
              <TextField
                {...email.input}
                id="email"
                required
                label="My email address is"
                name="email"
                type="email"
                helperText={email.meta.touched && email.meta.error}
                error={!!(email.meta.touched && email.meta.error)}
                placeholder="email"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                {...delegatorAddress.input}
                id="address"
                required
                type="text"
                helperText={
                  delegatorAddress.meta.touched && delegatorAddress.meta.error
                }
                error={
                  !!(
                    delegatorAddress.meta.touched && delegatorAddress.meta.error
                  )
                }
                label="My bonded Ethereum address is"
                name="delegatorAddress"
                placeholder="e.g. 0x4bbeEB066eD09..."
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
              />
              <FormControl>
                <FormLabel>Email me*</FormLabel>
                <StyledRadioGroup
                  defaultValue="weekly"
                  aria-label="Frequency"
                  onChange={(e) => frequency.input.onChange(e.target.value)}
                  name="frequency">
                  <FormControlLabel
                    value="weekly"
                    id="weekly"
                    control={<Radio />}
                    label="Weekly"
                  />
                  <FormControlLabel
                    value="monthly"
                    id="monthly"
                    control={<Radio />}
                    label="Monthly"
                  />
                </StyledRadioGroup>
              </FormControl>
              <ButtonContainer>
                <Button
                  disabled={submitting}
                  type="submit"
                  variant="contained"
                  color="primary">
                  SIGN UP
                </Button>
                <Label>One click unsubscription in email.</Label>
              </ButtonContainer>
            </Form>
          </Column>
        </Wrapper>
      </Container>
    </Background>
  )
}
