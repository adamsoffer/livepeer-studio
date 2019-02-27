import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { Container } from '../../lib/helpers'
import { Root, Wrapper } from './styles'
import Link from 'next/link'

export default () => {
  return (
    <Root>
      <Container>
        <Wrapper>
          <Typography style={{ marginBottom: 56 }} variant="h4" component="h2">
            Products & Tools
          </Typography>
          <Grid container spacing={24}>
            <Grid item xs={12} sm={6}>
              <Link href="/staking-alerts">
                <a>
                  <Card raised>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, .2)',
                          height: 140,
                          padding: '32px 0'
                        }}
                        image="/static/img/alert.svg"
                        title="Staking Alerts"
                      />
                      <CardContent>
                        <Typography
                          style={{ marginBottom: 16 }}
                          variant="h5"
                          component="h2">
                          Staking Alerts
                        </Typography>
                        <Typography component="p">
                          Sign up to receive email alerts with your earnings and
                          keep tabs on how your transcoder is performing.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </a>
              </Link>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Link
                passHref
                href="https://thegraph.com/explorer/subgraph/graphprotocol/livepeer">
                <a target="_blank" rel="noopener noreferrer">
                  <Card raised>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, .2)',
                          height: 140,
                          padding: '32px 0'
                        }}
                        image="/static/img/thegraph.svg"
                        title="The Livepeer Subgraph"
                      />
                      <CardContent>
                        <Typography
                          style={{ marginBottom: 16 }}
                          variant="h5"
                          component="h2">
                          The Livepeer Subgraph
                        </Typography>
                        <Typography component="p">
                          Query indexed Livepeer data over GraphQL using the
                          Graph Protocol.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </a>
              </Link>
            </Grid>
          </Grid>
        </Wrapper>
      </Container>
    </Root>
  )
}
