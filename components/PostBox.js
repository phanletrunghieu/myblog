import React, { PureComponent } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import styles from '../styles/PostBox.module.scss'
import {reformatDate, truncateSummary} from '../utils/common'

export default class PostBox extends PureComponent {
    render() {
        const {slug, image, title, date, markdownBody} = this.props
        return (
            <Link key={slug} href="/post/[slug]" as={`/post/${slug}`}>
                <div className={styles.container}>
                    <div className={styles.imageContainer} style={{backgroundImage: `url('${image}')`}}></div>
                    <div className={styles.contentContainer}>
                        <header className={styles.header}>
                            <h1>{title}</h1>
                            <p className={styles.date}>{reformatDate(date)}</p>
                            <span className={styles.readDuration}>128 min</span>
                        </header>
                        <div className={styles.body}>
                            <ReactMarkdown
                                source={truncateSummary(markdownBody)}
                            />
                        </div>
                    </div>
                </div>
            </Link>
        )
    }
}
