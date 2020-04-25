import matter from 'gray-matter'

export function getCategory() {
    let context = require.context('../posts', true, /\.md$/)
    const keys = context.keys()
    const values = keys.map(context)
    let categories = []
    keys.map((key, index) => {
        const value = values[index]
        // Parse yaml metadata & markdownbody in document
        const document = matter(value.default)

        if (!document.data.categories) {
            return
        }

        categories = categories.concat(document.data.categories)
    })

    // remove duplicate
    categories = categories.filter((c, index, arr) => arr.indexOf(c) == index)

    return categories
}