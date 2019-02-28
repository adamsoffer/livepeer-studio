import Normalize from "react-normalize";
import Head from "next/head";
import grey from "@material-ui/core/colors/grey";
import { Global, css } from "@emotion/core";
import { withTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "emotion-theming";
import Footer from "../Footer";

type Props = {
  theme?: any;
  title?: string;
  description?: string;
  children: object;
  image?: string;
  url?: string;
};

export default withTheme()(({ theme, children }: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <link
          href="https://fonts.googleapis.com/css?family=Poppins:400,400i,500,500i,600,600i,700,700i|IBM+Plex+Mono:400,400i,500,500i,600,600i,700,700i"
          rel="stylesheet"
        />
      </Head>
      <Normalize />
      <Global
        styles={css`
          * {
            font-family: "Poppins", sans-serif;
          }
          body {
            background-color: ${grey[900]};
            color: ${theme.palette.common.white};
          }
          a {
            text-decoration: none;
            color: inherit;
          }
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            margin: 0;
          }
        `}
      />
      {children}
      <Footer />
    </ThemeProvider>
  );
});
