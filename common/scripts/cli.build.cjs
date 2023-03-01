// This is used for running CLI commands from heft runScript tasks.
const { exec } = require('child_process')
exports.runAsync = function runAsync({
    scriptOptions: {
        command,
        args
    },
    heftConfiguration: {
        _buildFolder: cwd
    }
}){
    args ??= []
    return new Promise((resolve, reject) => exec(
        `${command} ${(Array.isArray(args) ? args : [args]).join(' ')}`,
        {
            cwd
        },
        (err, stdout, stderr) => {
            if(err){
                reject(Buffer.isBuffer(stderr) ? stderr.toString('utf-8') : stderr)
                return
            }
            resolve(Buffer.isBuffer(stdout) ? stdout.toString('utf-8') : stdout)
        }
    ))
}
