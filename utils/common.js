export function getSlug(name) {
    name = name || ""
    let split = name.split('/')
    return split[split.length - 1]
            .replace(/ /g, '-')
            .toLowerCase()
            .trim()
}