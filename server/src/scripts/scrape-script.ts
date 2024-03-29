/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
// const firebase = require('./firebaseconfig');
// const fbService = require('../lib/firebase');

// Define the URL to scrape
const catsURL = 'https://www.aspca.org/pet-care/animal-poison-control/cats-plant-list';
const dogsURL = 'https://www.aspca.org/pet-care/animal-poison-control/dogs-plant-list'
const sectionDiv = '.view-all-plants-list'

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// const keyFile: string = process.env.KEY_FILE as string;
const adminKey = '{"type": "service_account","project_id": "pet-plants-b","private_key_id": "d336fc1175ce12965168980b64b6383dc21c0bcb","private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9wu1FOirHa5nN\nt/0IjlYThhOHDdL8qZaiYO6qrXsKAULN7AA8RzZj/em65JxnyDctfy8b/Zu2964q\nI2kX0COmSOuRQ+DKgt/mHJ8LN5UPOEJY8ry70Df3HRQ2T+c8m4q/npfdAuaVGSiL\n4OfQCL4Uz840phGcEIes23MXBKtCwPZkL6ThfwB5kNUQqWgslfAKuEGh5BHEh8+j\nGxEF38ipE/iYpz1fsXuXEUv9AJwCy4u51nQ8qkXC1eEpEzumXbtfrV6i76bqkTHs\nbw1RgxWm/FD7NxBbNwY1V4e5LcZeXWcncUXXAw4zicEvIyvtJCCNls8HvGSwW1Kz\nlR89tBqdAgMBAAECggEADFPoyVh19YEjG4x8+tc7tnvSx8a+jXgF/MllJT+XxfFe\n3JUHpI2FdiRa0MUFIoU3t8ldWd6VWmMHqfNQIpd8wr2A15iBjB50UGp3wZ6MMjzX\n1e1Pv2LPnp/sE3rdkqAnONDN3FznIR9iioh4qYOb4lW9Yh8Pd079RXNMlt2l3kmh\nVmSLieiyVZWNBNkZYqB38GsbViv/yMqXedVi7haVAEuOcppRv9wkH2ptTccl59yf\ns0V2duwhHfQQdlreKfC1yUaUAQv7X3r9gwwFgfabQTN/FfOnzgtO8X5mvemYPdlH\nZHBAptKpyCgxRlJ3WKQDbRp5pXDybWTrYCiwSG4R2QKBgQDvcyq2RspnlOGfRJU+\nLbApaKzD7f3zbnzUydklIavsSfP502nVggMWVyOAkNdAra98YOQIn1mKf68Rh8Zi\ntik0FW5zyLu2OIBefZzotrfQmIz6enGTv4hh6qWMpDU9KcFFPMdVeGfgA78qG7bV\nFzdTmhT60AjsNhUWegnJHxnxpQKBgQDK4JJAhDak/gFVc1zhPgQFdqou/lJ7WMBH\nobFFzzJ3rflxjN5sIRdgApmv+MYW5CMoBXHEb3y2d5ZdFMBMDMTAfh6NPE11mIO4\nkYca3q6D9PNaCy02UQbGb7QOWqdsjYsBrhN+RaoH3vNn+D7yjPz3S1meTs39biH4\ny+l69frDmQKBgEsSXWrGaQDuoYowk2XqJxfkdH39KKhglIyWOBk3JFKxoOdLjBvf\nZh5j9YKCZqoliiZBrlyxsP4GKBoj6mPaXrKwoW91mLx5nG2DjmU7nAevPEvvhZpf\n619flMWyWeqyI6EUfB5k4JRQOGf4RmsqmzL/1OIJxTJhhl0Ep/rBYH3tAoGADsKH\n4Wm9EAPq1OyvtTNt13fqqcCW/6JVWuDIpOuOIGbn3vsAs500tid6RvMydjfi1uaO\ngFwcFqpcpij8VIwZRGfokR3yBLwz2Rm9WpcY20DW85Yck/cRJx65WtH9nEgv9M9V\nW7p1xFzUGJxW+A6J2PQCcSIKmoWIszEiq2957wECgYEAvdAPRVu2uP3IMDWPinUi\n7UEKWV1RftM5uCg54bQMzyzlZ28KdwHoP6c4OFUwMCVtgxCADuA4BMy3WAoZRZn7\nD4PvNvHijXvBUpG/LpuyZpGIK83QJHL8Zz+3RlOLk4iLFNB0htDjapPansS/5+7d\nNajDYM+0TmnR77HhLRi9S8E=\n-----END PRIVATE KEY-----\n","client_email": "firebase-adminsdk-s4s6m@pet-plants-b.iam.gserviceaccount.com","client_id": "114765680800589120993","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-s4s6m%40pet-plants-b.iam.gserviceaccount.com"}'
const adminCert = JSON.parse(adminKey);

// type FirebaseService = {
//   admin: admin.app.App;
//   db: admin.firestore.Firestore;
// }

let service = null;

//Service as a singleton
const firebaseService = () => {
  if(service === null){
    //first time here, initialize the service
    console.log("initializing the firebase app.");
    const adminApp = admin.initializeApp({
      credential: admin.credential.cert(adminCert)
    });
    const db = getFirestore(adminApp);

    service = {
      admin: adminApp,
      db: db,
    };
  }

  return service;
};

// Use axios to fetch the webpage content
const scrape = async (url) => {
  const scrappedData = []
  let _browser;

  const urls = await puppeteer.launch()
    .then(browser => {
      _browser = browser;
      return _browser.newPage()
    })
    .then(async page => {
    const output = await page.goto(url);
    console.log('url', output)
    await page.waitForSelector('.view-all-plants-list')
    return await page.evaluate(sectionDiv => {
      const links = [...document.querySelectorAll('.view-content > .views-row')].map(el => el.querySelector('a').href)
      return links;
    }, sectionDiv)
  })

  console.log('urls', urls);
  
     const pagePromise = async (link) => {
        const page = await _browser.newPage()
        await page.goto(link)
        let dataObj = {};
        const commonNames = '.pane-node-field-additional-common-names'

      dataObj.image = await page.evaluate(() => {
        const image = document.querySelector('.field-item > img')?.getAttribute('src')
        return image ? image : ''
      })

        dataObj.name = await page.evaluate(() => {
          const name = document.querySelector('.pane-1 > h1')?.textContent
          return name ? name : ''
        })

        dataObj.popularNames = await page.evaluate(commonNames => {
        const names = document.querySelector('.field-name-field-additional-common-names > .field-items')?.textContent
        if (names) {
          const splitNames = names.split(": ")
          return splitNames[1].split(', ')
        }
        return [];
        }, commonNames)

        dataObj.scientificName = await page.evaluate(() => {
        const name = document.querySelector('.field-name-field-scientific-name > .field-items')?.textContent
        if (name) {
          const splitName = name.split(": ")
          return splitName[1]
        }
        return '';
        })

        dataObj.family = await page.evaluate(() => {
        const familyName = document.querySelector('.field-name-field-family > .field-items')?.textContent
        if (familyName) {
          const splitName = familyName.split(": ")
          return splitName[1]
        }
        return '';
      })

      dataObj.signs = await page.evaluate(() => {
        const signs = document.querySelector('.field-name-field-clinical-signs > .field-items')?.textContent
        if (signs) {
          const splitName = signs.split(": ")
          return splitName[1]
        }
        return '';
      })

      dataObj.description = await page.evaluate(() => {
        const description = document.querySelector('.field-name-field-toxic-principles > .field-items')?.textContent
        if (description) {
          const splitName = description.split(": ")
          return splitName[1]
        }
        return '';
      })

      dataObj.toxicCats = await page.evaluate(() => {
        const toxicity = document.querySelector('.field-name-field-toxicity > .field-items')?.textContent
        if (toxicity) {
          const splitName = toxicity.split(": ")
          return !splitName[1].includes['Non-Toxic to Cats'] && splitName[1].includes('Toxic to Cats')
        }
        return false;
      })

      dataObj.toxicDogs = await page.evaluate(() => {
        const toxicity = document.querySelector('.field-name-field-toxicity > .field-items')?.textContent
        if (toxicity) {
          const splitName = toxicity.split(": ")
          return !splitName[1].includes['Non-Toxic to Dogs'] && splitName[1].includes('Toxic to Dogs')
        }
        return false;
      })

        console.log('obj', dataObj);
        page.close()
      }
      let i = 0;
    for(link in urls) {
      const currentPageData = await pagePromise(urls[link]);
      if(i++ < 5) console.log(currentPageData);
      scrappedData.push(currentPageData)
    }

    await _browser.close();
    scrappedData.forEach(async datum => {
      await firebaseService().db.collection('plants').add(datum);
    })
  }

try {
  scrape(catsURL);
  // scrape(dogsURL);
} catch (e) {
  console.log('error', e)
}

//NOTE: You can run this script from a command line with the following command:
// node /path/to/scrape-script.ts
