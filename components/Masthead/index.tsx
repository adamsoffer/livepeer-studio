import { Button } from "@material-ui/core";
import { Container } from "../../lib/helpers";
import { Root, Subheading, Heading } from "./styles";
import * as Scroll from "react-scroll";

let ScrollLink = Scroll.Link;

export default () => {
  return (
    <Root>
      <Container>
        <Heading>✧･ﾟ Livepeer Studio ･ﾟ✧</Heading>
        <Subheading>
          Building products & tools for the Livepeer ecosystem.
        </Subheading>
        <Button variant="contained" color="primary">
          <ScrollLink to="products" smooth={true}>
            View Products & Tools
          </ScrollLink>
        </Button>
      </Container>
    </Root>
  );
};
