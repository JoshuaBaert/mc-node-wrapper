const spawn = require('child_process').spawn;
const isDev = process.env.NODE_ENV === 'development';

module.exports = Base => class extends Base {

    startServer(jarPath) {
        let workingDir = './server';
        this.serverProcess = spawn('java', [
            isDev ? '-Xmx1g' : '-Xmx7g',
            isDev ? '-Xms512m' : '-Xms1024m',
            '-jar',
            jarPath.replace(workingDir, '.'),
            'nogui',
        ], { cwd: workingDir });

        this.serverProcess.stdout.on('data', this.log.bind(this));
        this.serverProcess.stderr.on('data', this.log.bind(this));

        process.stdin.setEncoding('utf8');
        // This handles manual input to the console and passes it forward to minecraft
        process.stdin.on('readable', () => {
            let chunk;
            // Use a loop to make sure we read all available data.
            while ((chunk = process.stdin.read()) !== null) {
                this.write(chunk);
            }
        });

        this.serverExitSetup();
    }

    shutdownServer() {
        return new Promise((resolve) => {
            const savedWolds = new Set();

            const shutdownListener = (data) => {
                const text = data.toString();

                if (/All\schunks\sare\ssaved/.test(text)) {
                    let world = text.replace(/.*\(([\w-]+)\).*/, '$1').trim();
                    world.length < 10 ? savedWolds.add(world) : null;
                }

                if (savedWolds.size >= 3) {
                    resolve();
                }
            };

            this.serverProcess.stdout.on('data', shutdownListener);
            this.writeToMine('stop');
        });
    }

    saveServer() {
        return new Promise((resolve, reject) => {
            const saveListener = (data) => {
                let text = data.toString();

                if (!(/Saved\sthe\sgame/.test(text))) return;
                this.serverProcess.stdout.removeListener('data', saveListener);

                resolve()
            };

            this.serverProcess.stdout.on('data', saveListener);
            this.writeToMine('save-all');
        });
    }
};
