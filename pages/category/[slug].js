import React, { PureComponent } from 'react'
import Meta from '../../components/Meta'
import matter from 'gray-matter'
import PostBox from '../../components/PostBox'
import Header from '../../components/Header'
import { getSlug } from '../../utils/common'

export default class CategoryTemplate extends PureComponent {
    render() {
        const {allBlogs, title, description, categories, slug} = this.props
        
        return (
            <div>
                <Meta title={title} description={description} />
                <Header categories={categories} currentSlug={slug} />
                <div style={{marginTop: 80}}>
                    {
                        allBlogs.map(post => (
                            <PostBox
                                key={post.slug}
                                image={post.frontmatter.image}
                                title={post.frontmatter.title}
                                date={post.frontmatter.date}
                                markdownBody={post.markdownBody}
                                slug={post.slug}
                            />
                        ))
                    }
                </div>
            </div>
        )
    }
}

CategoryTemplate.defaultProps = {
    allBlogs: [],
}

export async function getStaticProps(ctx) {
    const { slug } = ctx.params
    const siteConfig = await import(`../../data/config.json`)
    //get posts & context from folder
    let context = require.context('../../posts', true, /\.md$/)
    const keys = context.keys()
    const values = keys.map(context)

    let posts = []
    let categories = []
    keys.map((key, index) => {
        // Create slug from filename
        const blogSlug = key
            .replace(/^.*[\\\/]/, '')
            .split('.')
            .slice(0, -1)
            .join('.')
        
        const value = values[index]
        // Parse yaml metadata & markdownbody in document
        const document = matter(value.default)

        if (!document.data.categories) {
            return
        }

        categories = categories.concat(document.data.categories)

        let findIndex = document.data.categories.findIndex(c => getSlug(c) == slug)
        if (findIndex != -1) {
            posts.push({
                frontmatter: document.data,
                markdownBody: document.content,
                slug: blogSlug,
            })
        }
    })

    // remove duplicate
    categories = categories.filter((c, index, arr) => arr.indexOf(c) == index)
    
    return {
        props: {
            slug,
            categories,
            allBlogs: posts,
            title: siteConfig.default.title,
            description: siteConfig.default.description,
        },
    }
}

export async function getStaticPaths() {
    let context = require.context('../../posts', true, /\.md$/)
    const keys = context.keys()
    const values = keys.map(context)
    
    let slugs = []
    keys.map((key, index) => {
        const value = values[index]
        // Parse yaml metadata & markdownbody in document
        const document = matter(value.default)
        if (!document.data.categories) {
            return
        }

        document.data.categories.forEach(category => {
            let slug = getSlug(category)
            let index = slugs.findIndex(c => c == slug)
            if (index == -1) {
                slugs.push(slug)
            }
        });
    })

    // create paths with `slug` param
    const paths = slugs.map(slug => `/category/${slug}`)
    
    return {
        paths,
        fallback: true,
    }
}