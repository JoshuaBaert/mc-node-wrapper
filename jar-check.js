const fs = require('fs');
const http = require('axios').default;
const path = require('path');

module.exports = function () {
    return new Promise(async function (resolve, reject) {
        let serverPath = './server',
            jarPath;

        let res = await http.get('https://launchermeta.mojang.com/mc/game/version_manifest.json');

        const latestVersion = res.data.versions.filter((v) => v.id === res.data.latest.release)[0];

        jarPath = `${serverPath}/minecraft_server.${latestVersion.id}.jar`;
        try {
            // check to make sure that server folder is there
            if (!fs.existsSync(`${serverPath}/`)) fs.mkdirSync(`${serverPath}/`);
            // If there isn't a eula.txt copy one from assets so we don't have to restart the server
            if (!fs.existsSync(`${serverPath}/eula.txt`)) fs.copyFileSync('./assets/eula.txt', `${serverPath}/eula.txt`);

            // if we don't have a jar file with the correct version we download the latest form mojang
            setTimeout(async () => {
                if (fs.existsSync(jarPath)) {
                    console.log('\nServer jar already present.\n');

                    resolve(jarPath);
                } else {
                    console.log('\nNo up to date server file. \nDownloading new server... Please Wait\n');

                    const writer = fs.createWriteStream(path.resolve(__dirname, jarPath));
                    writer.on('finish', () => {
                        console.log('Finished downloading minecraft.');
                        resolve(jarPath);
                    });
                    writer.on('error', (e) => reject('Problem downloading jar\n' + e));

                    const latestInfo = await http.get(latestVersion.url);
                    let downloadUrl = latestInfo.data.downloads.server.url;

                    http.get(downloadUrl, { responseType: 'stream' }).then((jarRes) => {
                        jarRes.data.pipe(writer);
                    });
                }
            }, 50)
        } catch (e) {
            reject(e);
        }
    });
};
