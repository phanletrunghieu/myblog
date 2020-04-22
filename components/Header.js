import React, { PureComponent } from 'react'
import Link from 'next/link'
import styles from '../styles/Header.module.scss'
import {getSlug} from '../utils/common'

export default class Header extends PureComponent {
    render() {
        const {categories, currentSlug} = this.props;

        return (
            <div className={styles.container}>
                <Link href="/"><h2 className={styles.logo}>Hlog</h2></Link>
                <div>
                    {
                        categories.map(category => (
                            <Link
                                key={category}
                                href="/category/[slug]"
                                as={`/category/${getSlug(category)}`}
                            >
                                <span className={currentSlug==getSlug(category) ? styles.categoryActive : styles.category}>{category}</span>
                            </Link>
                        ))
                    }
                </div>
                <div></div>
            </div>
        )
    }
}

Header.defaultProps = {
    categories: [],
}