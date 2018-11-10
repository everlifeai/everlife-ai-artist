'use strict'
const { exec } = require('child_process')
const path = require('path')

function drawMeLike(imgpath, checkpoint) {
    const pwd = process.cwd()

    const imgmount = path.join("/in", path.basename(imgpath))
    const imgin = path.resolve(imgpath)

    const cmd = `docker run --rm -i -v "${pwd}/checkpoints:/checkpoints" -v "${pwd}/out":/out -v "${imgin}":"${imgmount}" aiartist python evaluate.py --checkpoint "/checkpoints/${checkpoint}" --in-path "${imgmount}" --out-path /out/output.jpg`

    exec(cmd, (err, stdout, stderr) => {
        if(err) {
            console.error(err)
        } else {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }
    })
}

if(process.argv[3]) drawMeLike(process.argv[2], process.argv[3])

