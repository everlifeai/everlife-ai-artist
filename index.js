'use strict'
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const http = require('http')
const url = require('url')
const shortid = require('shortid')
const formidable = require('formidable')
const os = require('os')
require('dotenv').config()

const ipaddr = require('./ipaddr')


const UPLOAD_DIR = os.tmpdir()
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR 
const IMG_BASE_URL = process.env.IMG_BASE_URL
if(!IMG_BASE_URL) {
    console.log(`Please add the environment variable IMG_BASE_URL`)
    process.exit(1)
}
if(!DOWNLOAD_DIR) {
    console.log(`Please add the environment variable DOWNLOAD_DIR`)
    process.exit(1)
}
/*      understand/
 * The main entry point of the program
 */
function main() {
    let cfg = loadConfig()
    startHttpServer(cfg)
}

function loadConfig() {
    let cfg = {}
    if(process.env.AIARTIST_PORT) {
        cfg.PORT = process.env.AIARTIST_PORT
    } else {
        cfg.PORT = 8195
    }
    return cfg
}

function startHttpServer(cfg) {
    let ip = ipaddr.getIP4Addrs()[0].addr
    o(`Server starting on http://${ip}:${cfg.PORT}..`)
    http.createServer(handleReq).listen(cfg.PORT)
}

function handleReq(req, res) {
    if(req.url.startsWith('/draw?')){
        const form = formidable({ multiples: true });
		form.uploadDir = UPLOAD_DIR	
        form.parse(req, (err, fields, files) => {
            if (err) {
              res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
              res.end(String(err));
              return;
            }
            return draw(files.img.path,fields.style, res)
        })
    }
}

function reply400(err, res) {
    e(err)
    res.writeHead(400)
    if(typeof err == 'string') res.end(err)
    else res.end()
}

function draw(imgpath, style, res ) {
    //let q = url.parse(req.url, true).query
    let name = shortid.generate()
    let outfile = `${name}.jpg`

    drawMeLike(style, imgpath, outfile, (err, outpath) => {
        if(err) {
            reply400(err, res)
        } else {
            res.end(outpath)
        }
    })
}

/*      outcome/
 * Use the docker image to generate a new image with the requested
 * style.
 *
 * The name is a joke: https://www.youtube.com/watch?v=WkqziN8F8oM
 */
function drawMeLike(style, imgpath, outfile, cb) {
    if(!style || !imgpath) return cb(`Missing required parameters!`)
    const pwd = process.cwd()
    const imgmount = path.join("/in", path.basename(imgpath))
    const imgin = path.resolve(imgpath)

    const cmd = `docker run --rm -i -v "${pwd}/checkpoints:/checkpoints" -v "${DOWNLOAD_DIR}":/out -v "${imgin}":"${imgmount}" aiartist python3 evaluate.py --checkpoint "/checkpoints/${style}.ckpt" --in-path "${imgmount}" --out-path /out/${outfile}`

    fs.stat(imgin, (err, stats) => {
        if(err || !stats.isFile()) cb(`${imgpath} not found`)
        else {
            fs.stat(path.join(pwd, 'checkpoints', `${style}.ckpt`), (err, stats) => {
                if(err || !stats.isFile()) cb(`No support for style: ${style}`)
                else {
                    exec(cmd, (err, stdout, stderr) =>{
                        if(err) {
                            if(err.message.indexOf && err.message.indexOf("System Memory")) {
                                cb(`File too big. Try with smaller version`)
                            }
                        } else {
                            cb(null, path.join(DOWNLOAD_DIR, outfile))
                        }
                    })
                }
            })
        }
    })

}

/*      outcome/
 * Show output
 */
function o(m) {
    console.log(m)
}

/*      outcome/
 * Show error
 */
function e(err) {
    console.error(err)
}

main()
