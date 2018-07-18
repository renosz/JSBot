const Command = require('./command');
const { Message, OpType, Location, Profile } = require('../curve-thrift/line_types');

class LINE extends Command {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
            cancel: 0,
            kick: 1,
        };
        this.messages;
        this.payload;
        this.stateUpload =  {
                file: '',
                name: '',
                group: '',
                sender: ''
            }
    }


    get myBot() {
        const bot = ['u1cab5ef6299af4713353b9843479952d','u22d94aac4e1659eb6f375ffc7cb17a53'];
        return bot; 
    }

    isAdminOrBot(param) {
        return this.myBot.includes(param);
    }

    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 16) {
            this.nukeGroup(operation.param1);
        }
    }
    command(msg, reply) {
        if(this.messages.text !== null) {
            if(this.messages.text === msg.trim()) {
                if(typeof reply === 'function') {
                    reply();
                    return;
                }
                if(Array.isArray(reply)) {
                    reply.map((v) => {
                        this._sendMessage(this.messages, v);
                    })
                    return;
                }
                return this._sendMessage(this.messages, reply);
            }
        }
    }

    async textMessage(messages) {
        this.messages = messages;
        let payload = (this.messages.text !== null) ? this.messages.text.split(' ').splice(1).join(' ') : '' ;
        let receiver = messages.to;
        let sender = messages.from;
        
        this.command('Halo', ['halo juga','ini siapa?']);
        this.command('kamu siapa', this.getProfile.bind(this));
        this.command('.status', `Your Status: ${JSON.stringify(this.stateStatus)}`);
        this.command(`.left ${payload}`, this.leftGroupByName.bind(this));
        this.command('.speed', this.getSpeed.bind(this));
        this.command('.kernel', this.checkKernel.bind(this));
        this.command(`kick ${payload}`, this.OnOff.bind(this));
        this.command(`cancel ${payload}`, this.OnOff.bind(this));
        this.command(`qrp ${payload}`, this.OnOff.bind(this));
        this.command(`.kickall ${payload}`,this.kickAll.bind(this));
        this.command(`.cancelall ${payload}`, this.cancelMember.bind(this));
        this.command(`.set`,this.setReader.bind(this));
        this.command(`.recheck`,this.rechecks.bind(this));
        this.command(`.clearall`,this.clearall.bind(this));
        this.command('.myid',`Your ID: ${messages.from}`)
        this.command(`.ip ${payload}`,this.checkIP.bind(this))
        this.command(`.ig ${payload}`,this.checkIG.bind(this))
        this.command(`.qr ${payload}`,this.qrOpenClose.bind(this))
        this.command(`.joinqr ${payload}`,this.joinQr.bind(this));
        this.command(`.spam ${payload}`,this.spamGroup.bind(this));
        this.command(`.creator`,this.creator.bind(this));

        this.command(`pap ${payload}`,this.searchLocalImage.bind(this));
        this.command(`.upload ${payload}`,this.prepareUpload.bind(this));
        this.command(`vn ${payload}`,this.vn.bind(this));

        if(messages.contentType == 13) {
            messages.contentType = 0;
            if(!this.isAdminOrBot(messages.contentMetadata.mid)) {
                this._sendMessage(messages,messages.contentMetadata.mid);
            }
            return;
        }

        if(this.stateUpload.group == messages.to && [1,2,3].includes(messages.contentType)) {
            if(sender === this.stateUpload.sender) {
                this.doUpload(messages);
                return;
            } else {
                messages.contentType = 0;
                this._sendMessage(messages,'Wrong Sender !! Reseted');
            }
            this.resetStateUpload();
            return;
        }

        // if(cmd == 'lirik') {
        //     let lyrics = await this._searchLyrics(payload);
        //     this._sendMessage(seq,lyrics);
        // }

    }

}

module.exports = LINE;
