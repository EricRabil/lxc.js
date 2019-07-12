declare module 'lxc' {
	/// <reference types="node" />
	import { ChildProcess } from 'child_process';
	export namespace LXCTools {
	    function textToArgs(text: string): string[];
	    function sysExec(command: string, sshBind?: string[] | false): ChildProcess;
	}
	export default class LXC {
	    private sshBind?;
	    constructor(sshBind?: string[] | undefined);
	    create(name: string, template: string): Promise<string>;
	    destroy(name: string): Promise<void>;
	    start(name: string): Promise<void>;
	    stop(name: string): Promise<void>;
	    freeze(name: string): Promise<void>;
	    unfreeze(name: string): Promise<void>;
	    /**
	     * creates a new snapshot
	     * @param name
	     * @param cbComplete
	     * @param cbData
	     */
	    cerateSnapshot(name: string): Promise<void>;
	    /**
	     * deletes a snapshot
	     * @param name
	     * @param snapshotName
	     * @param cbComplete
	     * @param cbData
	     */
	    deleteSnapshot(name: string, snapshotName: string): Promise<void>;
	    /**
	     * restores a snapshot
	     * @param name
	     * @param snapshotName
	     * @param newName [optional] name of restored lxc.
	     * @param cbComplete
	     * @param cbData
	     */
	    restoreSnapshot(name: string, snapshotName: string, newName: string): Promise<void>;
	    /**
	     * Lists all snapshots
	     * @param name
	     * @param cbComplete
	     * @param cbData
	     */
	    listSnapshots(name: string, snapshotName: string): Promise<Array<{
	        name: string;
	        dir: string;
	        date: string;
	    }>>;
	    /**
	     * returns machine's ip
	     * @param name
	     * @param cbComplete
	     */
	    getIP(name: string): Promise<string>;
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
	    attach(name: string, command: string): ChildProcess;
	    list(): Promise<{
	        name: string;
	        state: string;
	        autostart: string;
	        groups: string;
	        ipv4: string;
	        ipv6: string;
	    }[]>;
	    _standardExec(command: string): Promise<string>;
	}
}
