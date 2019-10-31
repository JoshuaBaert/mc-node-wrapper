module.exports = Base => class extends Base {

    // Converting data structure to Javascript
    parseEntityData(rawString) {
        let entityStr = rawString.split(' ').map((t) => {
            // ints and bools
            if (/\d+b/.test(t)) return t.replace(/(\d+)b/, '$1');

            // seconds to number
            let secondsReg = /(\d+)s/;
            if (secondsReg.test(t)) return t.replace(secondsReg, '$1');

            //floats / doubles
            if (/\d+\.\d*(d|f)/.test(t)) {
                return t.split('.')
                    .map((str, i) => {
                        if (i === 1) {
                            return str.replace(/(.*)(\d+)(.*)/, '$1 $2 $3')
                                .split(' ')
                                .map(d => /\d+/.test(d) ? d.substr(0, 3) : d)
                                .join('');
                        }
                        return str;
                    }).join('.')
                    .replace(/[df]/, '');
            }

            // Weird L?
            if (/(-{0,1}\d+)L/.test(t)) return t.replace(/(-{0,1}\d+)L/, '"$1"');

            // Default
            return t;
        }).join(' ');

        return eval(`(${entityStr})`);
    }

    getEntityData(playerName, path) {
        return new Promise((resolve) => {
            const listenForData = (data) => {
                let text = data.toString();

                if (!(/has\sthe\sfollowing\sentity\sdata:/).test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForData);
                let rawEntityText = text.split('entity data: ')[1];
                let entityData = this.parseEntityData(rawEntityText);

                resolve(entityData);
            };

            this.serverProcess.stdout.on('data', listenForData);
            this.writeToMine(`data get entity ${playerName} ${path}`);
        });
    }

    getPlayerPosition(playerName) {
        return this.getEntityData(playerName, 'Pos');
    }

    getPlayerRotation(playerName) {
        return this.getEntityData(playerName, 'Rotation')
    }

    async getPlayerDimension(playerName) {
        let dimensionInt = await this.getEntityData(playerName, 'Dimension');

        return (() => {
            switch(dimensionInt){
                case 0:
                    return 'minecraft:overworld';
                case -1:
                    return 'minecraft:the_nether';
                case 1:
                    return 'minecraft:the_end';
                default:
                    return null;
            }
        })();
    }
};