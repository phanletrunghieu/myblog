import React, { PureComponent } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import styles from '../styles/PostBox.module.scss'

export default class PostBox extends PureComponent {
    truncateSummary(content) {
        return content.slice(0, 200).trimEnd()
    }

    reformatDate(fullDate) {
        const date = new Date(fullDate)
        return date.toDateString().slice(4)
    }

    render() {
        const {slug, image, title, date, markdownBody} = this.props
        return (
            <Link key={slug} href="/post/[slug]" as={`/post/${slug}`}>
                <div className={styles.container}>
                    <div className={styles.contentContainer}>
                        <header className={styles.header}>
                            <h1>{title}</h1>
                            <p className={styles.date}>{this.reformatDate(date)}</p>
                            <span className={styles.readDuration}>128 min</span>
                        </header>
                        <div className={styles.body}>
                            <ReactMarkdown
                                source={this.truncateSummary(markdownBody)}
                            />
                        </div>
                    </div>
                    <div className={styles.imageContainer} style={{backgroundImage: `url('${image}')`}}></div>
                </div>
            </Link>
        )
    }
}
