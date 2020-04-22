import React, { PureComponent } from 'react'
import Meta from '../../components/Meta'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'
import {getSlug} from '../../utils/common'
const glob = require('glob')

export default class BlogTemplate extends PureComponent {
    render() {
        const {siteTitle, markdownBody} = this.props
        return (
            <div>
                <Meta title={siteTitle} />
                <ReactMarkdown source={markdownBody} />
            </div>
        )
    }
}

export async function getStaticProps(ctx) {
    const { slug } = ctx.params
    const siteConfig = await import(`../../data/config.json`)
    const content = await import(`../../posts/${slug}.md`)
    const data = matter(content.default)
    return {
        props: {
            siteTitle: siteConfig.title,
            frontmatter: data.data,
            markdownBody: data.content,
        },
    }
}

export async function getStaticPaths() {
    //get all .md files in the posts dir
    const posts = glob.sync('posts/**/*.md')
  
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