const fs = require('fs')

const json = JSON.parse(fs.readFileSync('output/imslp.json', 'utf8'))

// const pair = json.flatMap(v => Object.keys(v)).reduce((a, c) => (a[c] = c.replace(/ /g, "_").toLowerCase(), a), Object.create(null))
const pair = {
  "Movements/SectionsMov'ts/Sec's": "movements_sections",
  "Composition Year": "composition_year",
  "Genre Categories": "genre_categories",
  "Work Title": "work_title",
  "Alternative. Title": "alternative_title",
  "Composer": "composer",
  "I-Catalogue NumberI-Cat. No.": "i_catalogue_number",
  "Year/Date of CompositionY/D of Comp.": "date_of_composition",
  "Average DurationAvg. Duration": "average_duration",
  "Composer Time PeriodComp. Period": "composer_time_period",
  "Piece Style": "piece_style",
  "Instrumentation": "instrumentation",
  "URL": "url",
  "First Publication": "first_publication",
  "Key": "key",
  "First Publication.": "first_publication",
  "External Links": "external_links",
  "Copyright Information": "copyright_information",
  "Opus/Catalogue NumberOp./Cat. No.": "catalogue_number",
  "First Performance.": "first_performance",
  "Extra Information": "extra_information",
  "Dedication": "dedication",
  "Related Works": "related_works",
  "Name Translations": "name_translations",
  "Name Aliases": "name_aliases",
  "Authorities": "authorities",
  "Incipit": "incipit",
  "Primary Sources": "primary_sources",
  "Extra Locations": "extra_locations",
  "Language": "language",
  "Librettist": "librettist",
  "Discography": "discography",
  "Text Incipit": "text_incipit",
  "InstrDetail": "instrdetail",
  "Templates": "templates"
}

const result = json.map(v => {
  let output = {}
  Object.entries(pair).forEach(p => {
    output[p[1]] = v[p[0]] || null
  })
  return output
})

fs.writeFileSync('output/bq_impotable.newline_delimited_json', result.map(v => JSON.stringify(v)).join('\n'), 'utf8')
