import Modal from "@material-ui/core/Modal";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Router, { withRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/Layout";
import SignupForm from "../components/SignupForm";
import Header from "../components/Header";
import styled from "@emotion/styled";
import { mq } from "../lib/helpers";

export const StyledPaper: any = styled(Paper)({
  width: "calc(100% - 40px)",
  outline: "none",
  padding: "32px 24px",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  [mq[2]]: {
    width: "inherit",
    maxWidth: 600
  }
});

const Page: any = ({ router: { query } }) => {
  let [open, setOpen] = useState(false);
  let modalTitle = "";
  let modalDescription = "";

  if (query.action == "confirm") {
    modalTitle = "Verification Successful";
    modalDescription = `Your email has been verified. We will send you an email with your earnings ${
      query.frequency == "weekly"
        ? "every Friday at 7AM EST (12PM UTC)"
        : "on the 1st of every month at 7AM EST (12PM UTC)"
    }.`;
  }

  if (query.action == "unsubscribe") {
    modalTitle = "Unsubscription Successful";
    modalDescription = `You've been successfully unsubscribed from the ${
      query.frequency == "weekly" ? "weekly" : "monthly"
    } email alert for the specified account.`;
  }

  return (
    <Layout>
      <Header />
      <SignupForm />
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        open={
          query.action == "confirm" || query.action == "unsubscribe" || open
        }
        onClose={() => setOpen(false)}
      >
        <StyledPaper elevation={5}>
          <CloseIcon
            onClick={() => Router.push("/staking-alerts")}
            style={{
              cursor: "pointer",
              position: "absolute",
              right: 16,
              top: 16
            }}
          />
          <Typography
            style={{ fontFamily: "Poppins", fontWeight: 600, marginBottom: 24 }}
            variant="h5"
            id="modal-title"
          >
            {modalTitle}
          </Typography>
          <Typography variant="subtitle1" id="modal-description">
            {modalDescription}
          </Typography>
        </StyledPaper>
      </Modal>
    </Layout>
  );
};

export default withRouter(Page);
