const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')
const decompress = require('decompress')
const tmp = require('tmp')
const _fs = require('fs')
const inquirer = require('inquirer')
const jsonfile = require('jsonfile')

const request = require('request').defaults({
    headers: {
        'User-Agent': 'node request'
    }
})

const REPOSITORIES_VUE_URL = 'https://github.com/BENcorry/c-template-vue/archive/vue.zip'
const REPOSITORIES_NUXT_URL = 'https://github.com/BENcorry/c-template-vue/archive/nuxt.zip'


function Info(msg) {
    console.log(`${chalk.inverse.green('INFO')}: ${msg}`)
}
function Warn(msg) {
    console.log(`${chalk.inverse.yellow('WARN')}: ${msg}`)
}
function Error(msg) {
    console.log(`${chalk.inverse.red('ERROR')}: ${msg}`)
}

function getZip(nuxt, savePath, cb) {
    const url = nuxt === 'nuxt' ? REPOSITORIES_NUXT_URL : REPOSITORIES_VUE_URL
    if (fs.existsSync(savePath)) {
        Error(`File already exist!`)
        return
    }
    Info(`Try to downloading template...`)
    const TMP_DOWNLOAD_PATH = tmp.tmpNameSync() + '.zip'
    const TMP_UNZIP_FOLFER = tmp.tmpNameSync()
    const file = fs.createWriteStream(TMP_DOWNLOAD_PATH)
    file.on('close', () => {
        Info(`Extracting template...`)
        decompress(TMP_DOWNLOAD_PATH, TMP_UNZIP_FOLFER).then(() => {
            Info(`Extracting template done...`)
            _fs.readdir(TMP_UNZIP_FOLFER, (err, files) => {
                if (err) {
                    Error(err)
                    return
                }
                fs.moveSync(path.join(TMP_UNZIP_FOLFER, files[0]), savePath)
                fs.unlinkSync(TMP_DOWNLOAD_PATH)
                cb && cb()
            })
        })
    }).on('error', err => {
        Error(err)
    })
    request.get(url)
    .on('error', err => {
        Error(`Error downloading: ${err}`)
    })
    .on('response', res => {
        if (res.statusCode !== 200) {
            Error(`Get zip url return not equal 200`)
        }
    })
    .on('end', () => {
        Info('Download finished!')
    })
    .pipe(file)
}

function projectInput(name, cb) {
    const input = {
        type: 'input',
        name: 'name',
        message: 'project name',
    }
    if (name) {
        input.default = () => {
            return name
        }
    }
    const questions = [
        input,
        {
            type: 'input',
            name: 'descript',
            message: 'project descript',
            default: () => {
                return 'A vue project'
            }
        },
        {
            type: 'input',
            name: 'version',
            message: 'project version',
            default: () => {
                return '1.0.0'
            }
        },
        {
            type: 'input',
            name: 'author',
            message: 'Author',
            default: () => {
                return 'Author'
            }
        },
        {
            type: 'rawlist',
            name: 'type',
            message: 'create a vue or nuxt cli',
            choices: () => {
                return ['vue', 'nuxt']
            },
            default: () => {
                return 'vue'
            }
        }
    ]
    inquirer.prompt(questions).then(answers => {
        cb(answers)
    })
}

module.exports = {
    Info,
    Warn,
    Error,
    getZip,
    projectInput,
    editProject: (project) => {
        const packagePath = path.join(project.name, 'package.json')
        try {
            const j = jsonfile.readFileSync(packagePath)
            j.name = project.name
            j.version = project.version
            j.description = project.description
            j.author = project.author
            jsonfile.writeFileSync(packagePath, j, {spaces: 2})
            Info('Complete!')
        } catch (e) {
            Error(e)
        }
    }
}