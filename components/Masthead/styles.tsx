import styled from "@emotion/styled";
import { mq } from "../../lib/helpers";

export const Root = styled.div({
  position: "relative",
  height: "calc(100vh)",
  display: "flex",
  alignItems: "center",
  backgroundImage: "url(/static/img/livepeer-squares.svg)",
  backgroundPosition: "center right",
  backgroundRepeat: "no-repeat"
});

export const Wrapper = styled.div({
  display: "flex",
  flexDirection: "column",
  width: "100%"
});

export const Heading = styled.h1({
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 24,
  [mq[2]]: {
    fontSize: 24
  }
});

export const Subheading = styled.h2({
  fontSize: 32,
  marginBottom: 32,
  lineHeight: "40px",
  [mq[2]]: {
    fontSize: 56,
    lineHeight: "72px",
    maxWidth: 800
  }
});

export const Body = styled.p({
  fontSize: 16,
  fontFamily: "'IBM Plex Mono', monospace",
  letterSpacing: "0",
  lineHeight: "30px",
  marginBottom: 40,
  [mq[2]]: {
    marginBottom: 0
  }
});

export const Form = styled.form({});

export const ButtonContainer = styled.div({
  display: "block"
});

export const Label = styled.div({
  fontSize: 12,
  marginTop: 16,
  fontFamily: "'IBM Plex Mono', monospace"
});
