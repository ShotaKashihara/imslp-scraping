const rp = require('request-promise')
const promiseMap = require('bluebird').map
const { JSDOM } = require('jsdom')
const fs = require('fs')
const sanitizeHtml = require('sanitize-html');
global.Element = (new JSDOM()).window.Element;
Object.defineProperty(global.Element.prototype, 'innerText', {
  get() {
    return sanitizeHtml(this.innerHTML, {
      allowedTags: ['br'], // remove all tags and return text content only
      allowedAttributes: {}, // remove all tags and return text content only
    });
  },
  configurable: true, // make it so that it doesn't blow chunks on re-running tests with things like --watch
});

// 
// For Orchestra
// https://imslp.org/wiki/List_of_Orchestra_Pieces_with_Parts_Available
// 
const json = JSON.parse(fs.readFileSync('./input/for_orchestra.json', 'utf8'))
const titles = Object.values(json['p1']).flat().map(t => t.split('|')[0])
// const titles = [
//   "Symphony No.2 (Rosaria, Danielle)",
//   "Symphony No.2 (Sago, Yasunori)",
// ]

async function getTable(title) {
  const url = `https://imslp.org/wiki/${encodeURIComponent(title)}`
  return await rp(url)
    .then(body => {
      console.log(`Finish request. ${title}`)
      const document = new JSDOM(body).window.document
      const wp_header = Array.from(document.querySelectorAll('.wp_header > table > tbody > tr'))
      const wi_body = Array.from(document.querySelectorAll('.wi_body > table > tbody > tr'))
      let result = wp_header.concat(wi_body).map(r => {
        return {
          key: r.querySelector('th').textContent.trim(),
          value: r.querySelector('td')
            ? r.querySelector('td').innerText.replace(/<br \/>/g, '\n').trim()
            : null
        }
      })
      result.push({ 'key': 'URL', 'value': url })
      return result
    })
    .catch(e => { console.error(`handle error title: ${title}`); throw e })
}

const main = async () => {
  const length = titles.length
  return await promiseMap(
    titles,
    (title, index) => {
      console.log(`[${index}/${length}] https://imslp.org/wiki/${title}: Requesting...`)
      return getTable(title)
    },
    { concurrency: 4 }
  )
}

(async () => {
  const result = await main()
  const flatten = result.map(v => {
    return v.reduce((result, current) => {
        result[current.key] = current.value
        return result
    }, {})
  })
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output')
  }
  fs.writeFile('output/imslp.json', JSON.stringify(flatten, null, 2), 'utf8', () => { })
})()
