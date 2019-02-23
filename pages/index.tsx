import { useState } from 'react'
import SignupForm from '../components/SignupForm'
import Layout from '../components/Layout'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CloseIcon from '@material-ui/icons/Close'
import { withRouter } from 'next/router'
import Router from 'next/router'

export default withRouter(({ router: { query } }) => {
  let [open, setOpen] = useState(false)
  let isVerified = query.verify == 'true'

  return (
    <Layout>
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
                ? 'every Friday at 12PM UTC (7AM EST)'
                : 'on the 1st of every month at 12PM UTC (7AM EST)'
            }.`}
          </Typography>
        </Paper>
      </Modal>
    </Layout>
  )
})
