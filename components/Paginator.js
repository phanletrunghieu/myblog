import React, { PureComponent } from 'react'
import Router from 'next/router'
import styles from '../styles/Paginator.module.scss'

class PageButton extends PureComponent {
    onClick = () => {
        const {href, baseUrl, page} = this.props
        Router.push(href, `${baseUrl}/${page}`)
    }

    render() {
        const {current, page, text} = this.props
        return (
            <a
                className={current == page ? (text == "<" || text == ">" ? styles.buttonDisable : styles.buttonActive) : styles.button}
                onClick={this.onClick}
            >
                {text || page}
            </a>
        )
    }
}

export default class Paginator extends PureComponent {
    renderPageItems() {
        const {count, current, href, baseUrl} = this.props

        let pageButtonProps = {
            href,
            baseUrl,
            current
        }

        let pageItems = []
        if (count < 8) {
            pageItems = [...Array(count).keys()].map(i=><PageButton key={i} {...pageButtonProps} page={i+1}/>)
            return pageItems
        }

        // count always >= 8
        if (current < 5) {
            pageItems = [...Array(5).keys()].map(i=><PageButton key={i} {...pageButtonProps} page={i+1}/>)
            pageItems.push(<PageButton key={pageItems.length} {...pageButtonProps} text="..." />)
            pageItems.push(<PageButton key={pageItems.length} {...pageButtonProps} page={count} />)
        } else if (current > (count + 1) - 5) {
            pageItems.push(<PageButton key={pageItems.length} {...pageButtonProps} page={1} />)
            pageItems.push(<PageButton key={pageItems.length} {...pageButtonProps} text="..." />)
            let tail = [...Array(5).keys()].map(i=><PageButton key={count-4+i} {...pageButtonProps} page={count-4+i}/>)
            pageItems = pageItems.concat(tail)
        } else {
            pageItems.push(<PageButton key={pageItems.length} {...pageButtonProps} page={1} />)
            pageItems.push(<PageButton key={pageItems.length} {...pageButtonProps} text="..." />)

            let tail = [...Array(3).keys()].map(i=><PageButton key={pageItems.length+i} {...pageButtonProps} page={current-1+i}/>)
            pageItems = pageItems.concat(tail)

            pageItems.push(<PageButton key={pageItems.length} {...pageButtonProps} text="..." />)
            pageItems.push(<PageButton key={pageItems.length} {...pageButtonProps} page={count} />)
        }

        return pageItems
    }

    render(){
        let pageItems = this.renderPageItems()
        const {count, current, href, baseUrl} = this.props

        let pageButtonProps = {
            href,
            baseUrl,
            current
        }
        return (
            <div className={styles.container}>
                <PageButton {...pageButtonProps} text="<" page={1} />
                {pageItems}
                <PageButton {...pageButtonProps} text=">" page={count} />
            </div>
        )
    }
}
