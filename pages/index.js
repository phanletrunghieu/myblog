import React, { PureComponent } from 'react'
import Meta from '../components/Meta'
import matter from 'gray-matter'
import PostBox from '../components/PostBox'

export default class Home extends PureComponent {
    render() {
        const {allBlogs, title, description} = this.props
        return (
            <div>
                <Meta title={title} description={description} />
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
        )
    }
}

export async function getStaticProps() {
    const siteConfig = await import(`../data/config.json`)
    //get posts & context from folder
    const posts = (context => {
        const keys = context.keys()
        const values = keys.map(context)
    
        const data = keys.map((key, index) => {
            // Create slug from filename
            const slug = key
                .replace(/^.*[\\\/]/, '')
                .split('.')
                .slice(0, -1)
                .join('.')
            const value = values[index]
            // Parse yaml metadata & markdownbody in document
            const document = matter(value.default)
            return {
                frontmatter: document.data,
                markdownBody: document.content,
                slug,
            }
        })
        return data
    })(require.context('../posts', true, /\.md$/))
  
    return {
        props: {
            allBlogs: posts,
            title: siteConfig.default.title,
            description: siteConfig.default.description,
        },
    }
}