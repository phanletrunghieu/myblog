import React, { PureComponent } from 'react'
import { Comments } from 'react-facebook';
import Meta from '../../components/Meta'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import CodeBlock from '../../components/CodeBlock'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'
import {getSlug, reformatDate, truncateSummary} from '../../utils/common'
import {getCategory} from '../../utils/category'
import styles from '../../styles/Post.module.scss'
const glob = require('glob')

export default class BlogTemplate extends PureComponent {
    state = {
        screenWidth: 0,
    }

    updateScreenWidth = () => {
        this.setState({screenWidth: window.document.body.clientWidth})
    }

    componentDidMount(){
        this.updateScreenWidth()
        window.addEventListener("resize", this.updateScreenWidth)
    }

    componentWillUnmount(){
        window.removeEventListener("resize", this.updateScreenWidth)
    }

    render() {
        const {siteTitle, markdownBody, frontmatter, categories} = this.props
        
        if(!frontmatter) return null

        const imageStyle = {
            backgroundImage: `url(${frontmatter.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
            height: this.state.screenWidth / 1265 * 500,
        }
        
        return (
            <div>
                <Meta
                    title={`${frontmatter.title} - ${siteTitle}`}
                    description={truncateSummary(markdownBody)}
                    image={frontmatter.image}
                />
                <Header categories={categories} />
                <div style={{marginTop: 120, marginBottom: 50}}>
                    <div className={styles.headerContainer}>
                        <h1>{frontmatter.title}</h1>
                        <div className={styles.subHeader}>
                            <p className={styles.date}>{reformatDate(frontmatter.date)}</p>
                            <span className={styles.readDuration}>{frontmatter.readDuration}</span>
                        </div>
                    </div>
                    <div style={imageStyle} />
                    <div className={styles.content}>
                        <ReactMarkdown
                            source={markdownBody}
                            renderers={{ code: CodeBlock }}
                        />
                    </div>
                    <div className={styles.comments}>
                        <Comments href={this.props.host + "/post/" + this.props.slug} />
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

BlogTemplate.defaultProps = {
    categories: [],
}

export async function getStaticProps(ctx) {
    const { slug } = ctx.params
    const siteConfig = await import(`../../data/config.json`)
    const content = await import(`../../posts/${slug}.md`)
    const data = matter(content.default)

    let categories = getCategory()

    return {
        props: {
            slug,
            siteTitle: siteConfig.title,
            frontmatter: data.data,
            markdownBody: data.content,
            categories,
            host: siteConfig.url,
        },
    }
}

export async function getStaticPaths() {
    //get all .md files in the posts dir
    const posts = glob.sync('posts/*.md')
    //remove path and extension to leave filename only
    const postSlugs = posts.map(file =>
        getSlug(file).slice(0, -3)
    )
  
    // create paths with `slug` param
    const paths = postSlugs.map(slug => `/post/${slug}`)
    return {
        paths,
        fallback: true,
    }
}