export function getSlug(name) {
    name = name || ""
    let split = name.split('/')
    return split[split.length - 1]
            .replace(/ /g, '-')
            .toLowerCase()
            .trim()
}

export function reformatDate(fullDate) {
    const date = new Date(fullDate)
    return date.toDateString().slice(4)
}

export function truncateSummary(content) {
    return content.slice(0, 200).trimEnd()
}