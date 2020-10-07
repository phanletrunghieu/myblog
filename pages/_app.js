import App from 'next/app'
import { FacebookProvider } from 'react-facebook';
import DefaultLayout from '../components/layouts/Default'
import '../styles/styles.scss'

export default class MyApp extends App {
    render() {
        const { Component, pageProps } = this.props
        const Layout = Component.Layout || DefaultLayout
        const childComponent = (
            <FacebookProvider appId="467475520812512">
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </FacebookProvider>
        )
        return childComponent
    }
}
