import styled from "@emotion/styled";
import { mq } from "../../lib/helpers";

export const Background = styled.div({
  position: "relative",
  paddingTop: 120,
  [mq[2]]: {
    height: "calc(100vh - 92px)"
  }
});

export const Wrapper = styled.div({
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "column",
  paddingBottom: 40,
  paddingTop: 40,
  width: "100%",
  [mq[2]]: {
    paddingBottom: 0,
    paddingTop: 80,
    flexDirection: "row"
  }
});

export const Column = styled.div({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  [mq[2]]: {
    width: "50%",
    maxWidth: 450
  }
});

export const Heading = styled.h1({
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 16,
  [mq[2]]: {
    fontSize: 18
  }
});

export const Subheading = styled.h2({
  fontSize: 40,
  [mq[2]]: {
    fontSize: 56,
    marginBottom: 16
  }
});

export const Body = styled.p({
  fontSize: 16,
  fontFamily: "'IBM Plex Mono', monospace",
  letterSpacing: "0",
  lineHeight: "30px",
  marginBottom: 40,
  [mq[2]]: {
    marginBottom: 0,
    maxWidth: 448
  }
});

export const Form = styled.form({});

export const ButtonContainer = styled.div({
  display: "block"
});

export const Label = styled.div({
  fontSize: 12,
  marginTop: 24,
  fontFamily: "'IBM Plex Mono', monospace"
});
