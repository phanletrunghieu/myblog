import React, { Component } from 'react'
import Github from '../assets/icon/github.svg'
import Linkedin from '../assets/icon/linkedin.svg'
import Facebook from '../assets/icon/facebook.svg'
import styles from '../styles/Footer.module.scss'
export default class Footer extends Component {
    render() {
        return (
            <div>
                <div className={styles.content}>
                    <div className={styles.logo}>Hlog</div>
                    <div className={styles.iconContainer}>
                        <a target="_blank" href="https://github.com/phanletrunghieu"><Github className={styles.logoSvg} /></a>
                        <a target="_blank" href="https://www.linkedin.com/in/phanletrunghieu"><Linkedin className={styles.logoSvg} /></a>
                        <a target="_blank" href="https://www.facebook.com/phanletrunghieu"><Facebook className={styles.logoSvg} /></a>
                    </div>
                </div>
            </div>
        )
    }
}
