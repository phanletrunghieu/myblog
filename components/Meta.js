import Head from 'next/head'
export default function Meta({title, description, image}) {
    return (
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <meta charSet="utf-8" />
            <meta name="description"        content={description}></meta>
            <meta property="og:type"        content="article" />
            <meta property="og:title"       content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image"       content={image || "http://static01.nyt.com/images/2015/02/19/arts/international/19iht-btnumbers19A/19iht-btnumbers19A-facebookJumbo-v2.jpg"} />
        </Head>
    )
}