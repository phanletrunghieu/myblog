import React, { PureComponent } from 'react'
import Meta from '../../components/Meta'
import matter from 'gray-matter'
import PostBox from '../../components/PostBox'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Paginator from '../../components/Paginator'

let perPage = 3

export default class CategoryTemplate extends PureComponent {
    render() {
        const {allBlogs, title, description, categories, currentPage, totalPage} = this.props
        return (
            <div>
                <Meta title={`${title}`} description={description} />
                <Header categories={categories} />
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
                <Paginator
                    count={totalPage}
                    current={currentPage}
                    href="/page/[slug]"
                    baseUrl="/page"
                />
                <Footer/>
            </div>
        )
    }
}

CategoryTemplate.defaultProps = {
    allBlogs: [],
    categories: [],
}

export async function getStaticProps(ctx) {
    const { slug } = ctx.params
    let page = slug
    
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
        posts.push({
            frontmatter: document.data,
            markdownBody: document.content,
            slug: blogSlug,
        })
    })

    posts.sort((a, b)=>new Date(b.frontmatter.date) - new Date(a.frontmatter.date))

    let totalPage = Math.ceil(posts.length/perPage)
    posts = posts.slice((page-1)*perPage, page*perPage)

    // remove duplicate
    categories = categories.filter((c, index, arr) => arr.indexOf(c) == index)
    
    return {
        props: {
            categories,
            allBlogs: posts,
            title: siteConfig.default.title,
            description: siteConfig.default.description,
            currentPage: page,
            totalPage,
        },
    }
}

export async function getStaticPaths() {
    let context = require.context('../../posts', true, /\.md$/)
    const keys = context.keys()
    
    let numPage = Math.ceil(keys.length/perPage)
    
    // create paths with `slug` param
    let paths = [...Array(numPage).keys()].map(k => `/page/${k+1}`)
    
    return {
        paths,
        fallback: true,
    }
}