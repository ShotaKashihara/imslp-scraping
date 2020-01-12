const rp = require('request-promise')
const promiseMap = require('bluebird').map
const { JSDOM } = require('jsdom')
const fs = require('fs')
const sanitizeHtml = require('sanitize-html');
global.Element = (new JSDOM()).window.Element;
Object.defineProperty(global.Element.prototype, 'innerText', {
  get() {
    return sanitizeHtml(this.innerHTML, {
      allowedTags: [ 'br' ], // remove all tags and return text content only
      allowedAttributes: {}, // remove all tags and return text content only
    });
  },
  configurable: true, // make it so that it doesn't blow chunks on re-running tests with things like --watch
});

// 
// For Orchestra
// https://imslp.org/wiki/List_of_Orchestra_Pieces_with_Parts_Available
// 
const titles = [
  "https://imslp.org/wiki/Symphony_No.3%2C_Op.55_(Beethoven%2C_Ludwig_van)",
  // "https://imslp.org/wiki/Symphony_No.4%2C_Op.60_(Beethoven%2C_Ludwig_van)",
  // "https://imslp.org/wiki/Symphony_No.5,_Op.67_%28Beethoven,_Ludwig_van%29",
  // "https://imslp.org/wiki/Symphony_No.6%2C_Op.68_(Beethoven%2C_Ludwig_van)",
  // "https://imslp.org/wiki/Symphony_No.7%2C_Op.92_(Beethoven%2C_Ludwig_van)",
  // "https://imslp.org/wiki/Symphony_No.8%2C_Op.93_(Beethoven%2C_Ludwig_van)",
  // "https://imslp.org/wiki/Symphony_No.9%2C_Op.125_(Beethoven%2C_Ludwig_van)",
]

const music = {
  url: "http://imslp.org",
  composer: "Beethoven",
  title: "Symphony No.3, Op.67",
  infomation: {

  }
}

async function getTable(title) {
  console.log(`${title}: Requesting...`)
  return await rp(`${title}`)
    .then(body => {
      console.log('Finish.')
      const document = new JSDOM(body).window.document
      const wp_header = Array.from(document.querySelectorAll('.wp_header > table > tbody > tr'))
      const wi_body = Array.from(document.querySelectorAll('.wi_body > table > tbody > tr'))
      return wp_header.concat(wi_body).map(r => {
        return {
          "key": r.querySelector('th').textContent.trim(),
          "value": r.querySelector('td').innerText.replace(/<br \/>/g, '\n').trim()
        }
      })
    })
}

const main = async () => {
  return await promiseMap(
    titles,
    title => getTable(title),
    { concurrency: 2 }
  )
}

(async () => {
  const result = await main()
  fs.writeFile('imslp.json', JSON.stringify(result, null, 2), 'utf8', () => {})

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
