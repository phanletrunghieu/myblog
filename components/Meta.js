import Head from 'next/head'
export default function Meta({title, description}) {
    return (
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <meta charSet="utf-8" />
            <meta name="Description" content={description}></meta>
        </Head>
    )
}