import React, { PureComponent } from 'react'
import Meta from '../../components/Meta'
import matter from 'gray-matter'
import PostBox from '../../components/PostBox'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Paginator from '../../components/Paginator'
import { getSlug } from '../../utils/common'

let perPage = 3

export default class CategoryTemplate extends PureComponent {
    render() {
        const {allBlogs, title, description, categories, slug, currentPage, totalPage} = this.props
        let currentCategory = categories.find(c => getSlug(c) == slug)
        return (
            <div>
                <Meta title={`${currentCategory} - ${title}`} description={description} />
                <Header categories={categories} currentSlug={slug} />
                <div style={{marginTop: 80}}>
                    {
                        allBlogs.map(post => (
                            <PostBox
                                key={post.slug}
                                image={post.frontmatter.image}
                                title={post.frontmatter.title}
                                date={post.frontmatter.date}
                                readDuration={post.frontmatter.readDuration}
                                markdownBody={post.markdownBody}
                                slug={post.slug}
                            />
                        ))
                    }
                </div>
                <Paginator
                    count={totalPage}
                    current={currentPage}
                    href="/category/[...slug]"
                    baseUrl={"/category/"+getSlug(currentCategory)}
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
    let categorySlug = ""
    let page = 1
    if (Array.isArray(slug)) {
        if (slug.length > 0) {
            categorySlug = slug[0]
        }

        if (slug.length > 1) {
            page = slug[1]
        }
    }
    
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

        let findIndex = document.data.categories.findIndex(c => getSlug(c) == categorySlug)
        if (findIndex != -1) {
            posts.push({
                frontmatter: document.data,
                markdownBody: document.content,
                slug: blogSlug,
            })
        }
    })

    posts.sort((a, b)=>new Date(b.frontmatter.date) - new Date(a.frontmatter.date))

    let totalPage = Math.ceil(posts.length/perPage)
    posts = posts.slice((page-1)*perPage, page*perPage)

    // remove duplicate
    categories = categories.filter((c, index, arr) => arr.indexOf(c) == index)
    
    return {
        props: {
            slug: categorySlug,
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
    const values = keys.map(context)
    
    let slugs = []
    let count = []
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
                count.push(1)
            } else {
                count[index]++
            }
        });
    })

    // create paths with `slug` param
    let paths = []
    slugs.forEach((slug, i) => {
        paths.push(`/category/${slug}`)
        let numPage = Math.ceil(count[i]/perPage)
        let pathsWithPagination = [...Array(numPage).keys()].map(k => `/category/${slug}/${k+1}`)
        paths = paths.concat(pathsWithPagination)
    });
    
    return {
        paths,
        fallback: true,
    }
}