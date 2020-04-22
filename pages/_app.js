import App from 'next/app'
import DefaultLayout from '../components/layouts/Default'
import '../styles/styles.scss'

export default class MyApp extends App {
    render() {
        const { Component, pageProps } = this.props
        const Layout = Component.Layout || DefaultLayout
        const childComponent = (
            <Layout>
                <Component {...pageProps} />
            </Layout>
        )
        return childComponent
    }
}
