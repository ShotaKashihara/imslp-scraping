const fs = require('fs')

const json = JSON.parse(fs.readFileSync('output/add_extract_infomation.json', 'utf8'))
json.forEach(v => {
    delete v.additional_information
})
fs.writeFileSync('output/bq_impotable.newline_delimited_json', json.map(v => JSON.stringify(v)).join('\n'), 'utf8')
