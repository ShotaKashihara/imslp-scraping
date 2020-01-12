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
const json = JSON.parse(fs.readFileSync('./for_orchestra.json', 'utf8'))
const titles = Object.values(json['p1']).flat().map(t => t.split('|')[0])
// const titles = [
//   // "Symphony No.2 (Rosaria, Danielle)",
//   "Symphony No.2 (Sago, Yasunori)",
// ]

async function getTable(title) {
  return await rp(`https://imslp.org/wiki/${encodeURIComponent(title)}`)
    .then(body => {
      console.log(`Finish request. ${title}`)
      const document = new JSDOM(body).window.document
      const wp_header = Array.from(document.querySelectorAll('.wp_header > table > tbody > tr'))
      const wi_body = Array.from(document.querySelectorAll('.wi_body > table > tbody > tr'))
      return wp_header.concat(wi_body).map(r => {
        return {
          "key": r.querySelector('th').textContent.trim(),
          "value": r.querySelector('td')
            ? r.querySelector('td').innerText.replace(/<br \/>/g, '\n').trim()
            : "(empty)"
        }
      })
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
  fs.writeFile('imslp.json', JSON.stringify(result, null, 2), 'utf8', () => { })

  // result.forEach(r => {
  //   r.forEach(r2 => {
  //     if(r2.key === "Work Title") {
  //       console.log(r2.value)
  //     }
  //     if(r2.key === "Instrumentation") {
  //       console.log(r2.value)
  //     }
  //   })
  // })
})()

const music = {
  url: "http://imslp.org",
  composer: "Beethoven",
  title: "Symphony No.3, Op.67",
  infomation: {

  }
}