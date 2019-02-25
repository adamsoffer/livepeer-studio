import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import Router, { withRouter } from 'next/router'
import { useState } from 'react'
import Layout from '../components/Layout'
import SignupForm from '../components/SignupForm'
import Header from '../components/Header'
import LivepeerSDK from '@livepeer/sdk'

const Page: any = ({ currentRound, router: { query } }) => {
  let [open, setOpen] = useState(false)
  let isVerified = query.verify == 'true'

  return (
    <Layout>
      <Header currentRound={currentRound} />
      <SignupForm />
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        open={isVerified || open}
        onClose={() => setOpen(false)}>
        <Paper
          elevation={5}
          style={{
            maxWidth: 600,
            outline: 'none',
            padding: '32px 24px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
          <CloseIcon
            onClick={() => Router.push('/')}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              right: 16,
              top: 16
            }}
          />
          <Typography
            style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 24 }}
            variant="h5"
            id="modal-title">
            Verification Successful
          </Typography>
          <Typography variant="subtitle1" id="modal-description">
            {`Your email has been verified. We will send you an email with your earnings ${
              query.frequency == 'weekly'
                ? 'every Friday at 7AM EST (12PM UTC)'
                : 'on the 1st of every month at 7AM EST (12PM UTC)'
            }.`}
          </Typography>
        </Paper>
      </Modal>
    </Layout>
  )
}

Page.getInitialProps = async () => {
  let { rpc } = await LivepeerSDK()
  let currentRound = await rpc.getCurrentRound()
  return { currentRound }
}

export default withRouter(Page)
