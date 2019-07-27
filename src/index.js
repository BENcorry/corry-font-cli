const yargs = require('yargs')
const util = require('./util')

const args = yargs.command({
    command: 'create <name>',
    desc: 'Create a vue tempate.',
    builder: {},
    handler: (argv) => {
        let projectName = argv.name
        util.projectInput(projectName, project => {
            projectName = project.name
            util.getZip(project.type, projectName, () => {
                util.editProject(project)
            })
        })
    }
})
.version()
.help()
.alias({
    'h': 'help',
    'v': 'version',
})
.strict(true)
.demandCommand()
.argv