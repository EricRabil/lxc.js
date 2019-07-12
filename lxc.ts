import child_process, { ChildProcess } from "child_process";

export namespace LXCTools {
    //http://stackoverflow.com/questions/10530532/
    export function textToArgs(text: string): string[] {
        var words: string[] = [];
        text.slice().replace(/"([^"]*)"|'([^']*)'|(\S+)/g,(g0,g1,g2,g3) => { words.push(g1 || g2 || g3 || ''); return ''; });
        return words;
    }

    export function sysExec(command: string, sshBind?: string[] | false): ChildProcess {
        if (sshBind && Array.isArray(sshBind))
        {
            var runCommand = sshBind.slice();
            runCommand.push(command)
        } else {
            var runCommand = textToArgs(command);
        }

        return child_process.spawn(runCommand.slice(0,1)[0], runCommand.slice(1));
    }
}

export default class LXC {
    constructor(private sshBind?: string[]) {

    }

    create(name: string, template: string): Promise<string> {
        return this._standardExec(`lxc-create -n ${name} -t ${template}`);
    }

    destroy(name: string): Promise<void> {
        return this._standardExec(`lxc-destroy -n ${name}`) as any;
    }

    async start(name: string): Promise<void> {
        const output = await this._standardExec(`lxc-start -n ${name} -d`);
        if (output.indexOf('no configuration file') >= 0) {
            throw new Error("Container does not exist.");
        }
        return;
    }

    stop(name: string): Promise<void> {
        return this._standardExec(`lxc-stop -n ${name}`) as any;
    }

    freeze(name: string): Promise<void> {
        return this._standardExec(`lxc-freeze -n ${name}`) as any;
    }

    unfreeze(name: string): Promise<void> {
        return this._standardExec(`lxc-unfreeze -n ${name}`) as any;
    }

    /**
     * creates a new snapshot
     * @param name
     * @param cbComplete
     * @param cbData
     */
    cerateSnapshot(name: string): Promise<void> {
        return this._standardExec(`lxc-snapshot -n ${name}`) as any;
    }

    /**
     * deletes a snapshot
     * @param name
     * @param snapshotName
     * @param cbComplete
     * @param cbData
     */
    deleteSnapshot(name: string, snapshotName: string): Promise<void> {
        return this._standardExec(`lxc-snapshot -n ${name} -d ${snapshotName}`) as any;
    }

    /**
     * restores a snapshot
     * @param name
     * @param snapshotName
     * @param newName [optional] name of restored lxc.
     * @param cbComplete
     * @param cbData
     */
    restoreSnapshot(name: string, snapshotName: string, newName: string): Promise<void> {
        return this._standardExec(`lxc-snapshot -n ${name} -r ${snapshotName} -N ${newName}`) as any;
    }

    /**
     * Lists all snapshots
     * @param name
     * @param cbComplete
     * @param cbData
     */
    async listSnapshots(name: string, snapshotName: string): Promise<Array<{name: string, dir: string, date: string}>> {
        const output = await this._standardExec(`lxc-snapshot -n ${name} -r `);
        return output.split("\n").map(line => line.split(" ")).map(([name, dir, date1, date2]) => ({ name, dir, date: `${date1} ${date2}` }));
    }

    /**
     * returns machine's ip
     * @param name
     * @param cbComplete
     */
    getIP(name: string): Promise<string> {
        return this._standardExec(`lxc-info -H -i -n ${name}`);
    }

    /**
     * Wrapper for lxc-attach command
     * 
     * Because there is the potential for arbitrary commands to be executed (and thus allowing memory overflow), you must handle data
     * on your own when using the attach command. This function returns the ChildProcess and you can
     * manually hook the data you want.
     * 
     * @param name
     * @param command
     * @param cbComplete
     */
    attach(name: string, command: string): ChildProcess {
        return LXCTools.sysExec(`lxc-attach -n ${name} -- ${command}`, this.sshBind);
    }

    async list() {
        const output = await this._standardExec('lxc-ls -f');
        return output.split("\n")
            .map(line => line.trim())
            .filter(line => line.indexOf('RUNNING') >= 0 || line.indexOf('FROZEN') >= 0 || line.indexOf('STOPPED') >= 0)
            .map(line => line.split(/\s+/gi))
            .filter(values => values.length >= 2)
            .map(([name, state, autostart, groups, ipv4, ipv6]) => ({ name, state, autostart, groups, ipv4, ipv6 }));
    }

    _standardExec(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let output: string = '';
            let err: string = '';
            const cp = LXCTools.sysExec(command, this.sshBind);
            cp.stdout.on('data', data => output += data);
            cp.stderr.on('data', data => err += data);
            cp.on('close', (code) => {
                if (code) {
                    return reject({
                        code,
                        err,
                        output
                    });
                }
                return resolve(output);
            });
        });
    }
}