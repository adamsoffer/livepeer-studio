import { Root, Wrapper, Logo } from './styles'
import { Container } from '../../lib/helpers'
import RoundWidget from '../RoundWidget'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import LivepeerSDK from '@livepeer/sdk'

export default () => {
  let [currentRound, setCurrentRound] = useState('0000')

  async function setData() {
    let { rpc } = await LivepeerSDK({ gas: 2.1 * 1000000 })
    let currentRoundNumber = await rpc.getCurrentRound()
    setCurrentRound(currentRoundNumber)
  }

  useEffect(() => {
    setData()
  }, [])

  return (
    <Root>
      <Container>
        <Wrapper>
          <Link href="/">
            <a>
              <Logo src="/static/img/logo.svg" />
            </a>
          </Link>
          <RoundWidget currentRound={currentRound} />
        </Wrapper>
      </Container>
    </Root>
  )
}
