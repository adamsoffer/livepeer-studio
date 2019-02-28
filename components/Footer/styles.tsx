import styled from "@emotion/styled";
import theme from "../../lib/theme";

export const Wrapper = styled.div({
  paddingTop: 32,
  paddingBottom: 32,
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  div: {
    fontFamily: "'IBM Plex Mono', monospace"
  },
  a: {
    textDecoration: "underline"
  }
});
