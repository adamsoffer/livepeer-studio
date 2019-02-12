import NextSeo from 'next-seo'
import Header from '../Header'
import Normalize from 'react-normalize'
import Head from 'next/head'
import { Global, css } from '@emotion/core'

type Props = {
  title?: string
  description?: string
  children: object
  image?: string
  url?: string
}

export default ({ title, description, children, url }: Props) => {
  const config = {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: url ? url : 'https://thinkfwd.co'
    }
  }
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css?family=Poppins:400,400i,500,500i,600,600i,700,700i"
          rel="stylesheet"
        />
      </Head>
      <NextSeo config={config} />
      <Normalize />
      <Global
        styles={css`
          * {
            font-family: 'Poppins', sans-serif;
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
      <Header />
      {children}
    </>
  )
}
