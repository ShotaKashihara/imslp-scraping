const fs = require('fs')
// const pair = json.flatMap(v => Object.keys(v)).reduce((a, c) => (a[c] = c.replace(/ /g, "_").toLowerCase(), a), Object.create(null))
const pair = {
  "Work Title": "work_title",
  "Composer": "composer",
  "Alternative. Title": "alternative_title",
  "Genre Categories": "genre_categories",
  "I-Catalogue NumberI-Cat. No.": "i_catalogue_number",
  "Piece Style": "piece_style",
  "URL": "url",
  "Key": "key",
  "Instrumentation": "instrumentation",
  "Movements/SectionsMov'ts/Sec's": "movements_sections",
  "Opus/Catalogue NumberOp./Cat. No.": "catalogue_number",
  "Composition Year": "composition_year",
  "Average DurationAvg. Duration": "average_duration",
  "Composer Time PeriodComp. Period": "composer_time_period",
  "Name Translations": "name_translations",
  "Name Aliases": "name_aliases",
  "Copyright Information": "copyright_information",
  // "Year/Date of CompositionY/D of Comp.": "date_of_composition",
  // "First Publication": "first_publication",
  // "First Publication.": "first_publication",
  // "External Links": "external_links",
  // "First Performance.": "first_performance",
  // "Extra Information": "extra_information",
  // "Dedication": "dedication",
  // "Related Works": "related_works",
  // "Authorities": "authorities",
  // "Incipit": "incipit",
  // "Primary Sources": "primary_sources",
  // "Extra Locations": "extra_locations",
  // "Language": "language",
  // "Librettist": "librettist",
  // "Discography": "discography",
  // "Text Incipit": "text_incipit",
  // "InstrDetail": "instrdetail",
  // "Templates": "templates",
}

const json = JSON.parse(fs.readFileSync('output/imslp.json', 'utf8')).map(v => {
  let output = {}
  Object.entries(pair).forEach(p => {
    output[p[1]] = v[p[0]] || null
  })
  return output
})

// ex1: "flute" -> ["flute", 1]
// ex2: "2 flute" -> ["flute", 2]
const extractPart = (v, partName) => {
  if (v.match(new RegExp(partName))) {
    if (v.match(new RegExp(`[1-9] ${partName}`))) {
      return [partName.replace(/[ -]/g, "_"), Number(v.match(new RegExp(`[1-9] ${partName}`))[0].split(" ")[0])]
    } else {
      return [partName.replace(/[ -]/g, "_"), 1]
    }
  } else {
    return []
  }
}

// Add instrument parts.
const parts = ["strings", "piccolo", "flute", "oboe", "english horn", "clarinet", "bass clarinet", "bassoon", "contrabassoon", "horn", "trumpet", "trombone", "tuba", "harp", "timpani", "triangle", "bass drum", "cymbal", "piano", "snare drum", "tambourine", "glockenspiel", "celesta", "tam-tam", "xylophone", "organ", "euphonium", "guitar"]

json.forEach(m => {
  const i = (m["instrumentation"] || "").toLowerCase()
  m["additional_infomation"] = Object.fromEntries(parts.map(p => extractPart(i, p)))
})

json.forEach(m => {
  const i = (m["average_duration"] || "").toLowerCase()
  let minutes = 0
  if (i.match(/ hour/)) {
    minutes += Number(i.match(/[0-9]* hour/)[0].split(" ")[0]) * 60
  }
  if (i.match(/ min/)) { 
    minutes += Number(i.match(/[0-9]* min/)[0].split(" ")[0])
  }
  if (minutes > 0) {
    m["additional_infomation"]["average_duration_minutes"] = minutes
  }
})

// Add composer's translation.
const composer_translation = JSON.parse(fs.readFileSync('input/composer_translation.json', 'utf8'))
json.forEach(m => {
  const composer = m["composer"]
  m["additional_infomation"]["composer_ja"] = composer_translation[composer].ja
})

fs.writeFileSync('output/add_extract_infomation.json', JSON.stringify(json, null, 2), 'utf8', () => { })
