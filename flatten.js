const fs = require('fs')

const json = JSON.parse(fs.readFileSync('imslp.json', 'utf8'))
const flatten = json.map(v => {
    return v.reduce((result, current) => {
        result[current.key] = current.value
        return result
    })
})
fs.writeFile('imslp_flatten.json', JSON.stringify(flatten, null, 2), 'utf8', () => { })
