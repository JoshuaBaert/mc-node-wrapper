const fs = require('fs');
const http = require('axios').default;
const path = require('path');

module.exports = function () {
    return new Promise(async function (resolve, reject) {
        let jarPath;

        let res = await http.get('https://launchermeta.mojang.com/mc/game/version_manifest.json');

        const latestVersion = res.data.versions.filter((v) => v.id === res.data.latest.release)[0];

        jarPath = `./server/${latestVersion.id}.minecraft-server.jar`;
        try {
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
        } catch (e) {
            reject(e);
        }
    });
};
