"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = __importDefault(require("child_process"));
var LXCTools;
(function (LXCTools) {
    //http://stackoverflow.com/questions/10530532/
    function textToArgs(text) {
        var words = [];
        text.slice().replace(/"([^"]*)"|'([^']*)'|(\S+)/g, function (g0, g1, g2, g3) { words.push(g1 || g2 || g3 || ''); return ''; });
        return words;
    }
    LXCTools.textToArgs = textToArgs;
    function sysExec(command, sshBind) {
        if (sshBind && Array.isArray(sshBind)) {
            var runCommand = sshBind.slice();
            runCommand.push(command);
        }
        else {
            var runCommand = textToArgs(command);
        }
        return child_process_1.default.spawn(runCommand.slice(0, 1)[0], runCommand.slice(1));
    }
    LXCTools.sysExec = sysExec;
})(LXCTools = exports.LXCTools || (exports.LXCTools = {}));
// https://github.com/lxc/lxc/issues/245
var LXC = /** @class */ (function () {
    function LXC(sshBind) {
        this.sshBind = sshBind;
    }
    LXC.prototype.create = function (name, template) {
        return this._standardExec("lxc-create -n " + name + " -t " + template);
    };
    LXC.prototype.createFromDownload = function (name, distro, release, arch) {
        return this._standardExec("lxc-create -t download -n " + name + " -- -d " + distro + " -r " + release + " -a " + arch);
    };
    LXC.prototype.destroy = function (name) {
        return this._standardExec("lxc-destroy -n " + name);
    };
    LXC.prototype.start = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._standardExec("lxc-start -n " + name + " -d")];
                    case 1:
                        output = _a.sent();
                        if (output.indexOf('no configuration file') >= 0) {
                            throw new Error("Container does not exist.");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LXC.prototype.stop = function (name) {
        return this._standardExec("lxc-stop -n " + name);
    };
    LXC.prototype.freeze = function (name) {
        return this._standardExec("lxc-freeze -n " + name);
    };
    LXC.prototype.unfreeze = function (name) {
        return this._standardExec("lxc-unfreeze -n " + name);
    };
    /**
     * creates a new snapshot
     * @param name
     * @param cbComplete
     * @param cbData
     */
    LXC.prototype.cerateSnapshot = function (name) {
        return this._standardExec("lxc-snapshot -n " + name);
    };
    /**
     * deletes a snapshot
     * @param name
     * @param snapshotName
     * @param cbComplete
     * @param cbData
     */
    LXC.prototype.deleteSnapshot = function (name, snapshotName) {
        return this._standardExec("lxc-snapshot -n " + name + " -d " + snapshotName);
    };
    /**
     * restores a snapshot
     * @param name
     * @param snapshotName
     * @param newName [optional] name of restored lxc.
     * @param cbComplete
     * @param cbData
     */
    LXC.prototype.restoreSnapshot = function (name, snapshotName, newName) {
        return this._standardExec("lxc-snapshot -n " + name + " -r " + snapshotName + " -N " + newName);
    };
    /**
     * Lists all snapshots
     * @param name
     * @param cbComplete
     * @param cbData
     */
    LXC.prototype.listSnapshots = function (name, snapshotName) {
        return __awaiter(this, void 0, void 0, function () {
            var output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._standardExec("lxc-snapshot -n " + name + " -r ")];
                    case 1:
                        output = _a.sent();
                        return [2 /*return*/, output.split("\n").map(function (line) { return line.split(" "); }).map(function (_a) {
                                var name = _a[0], dir = _a[1], date1 = _a[2], date2 = _a[3];
                                return ({ name: name, dir: dir, date: date1 + " " + date2 });
                            })];
                }
            });
        });
    };
    /**
     * returns machine's ip
     * @param name
     * @param cbComplete
     */
    LXC.prototype.getIP = function (name) {
        return this._standardExec("lxc-info -H -i -n " + name);
    };
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
    LXC.prototype.attach = function (name, command, env) {
        return LXCTools.sysExec((env ? env + " " : '') + "lxc-attach --keep-env -n " + name + " -- " + command, this.sshBind);
    };
    LXC.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._standardExec('lxc-ls -f')];
                    case 1:
                        output = _a.sent();
                        return [2 /*return*/, output.split("\n")
                                .map(function (line) { return line.trim(); })
                                .filter(function (line) { return line.indexOf('RUNNING') >= 0 || line.indexOf('FROZEN') >= 0 || line.indexOf('STOPPED') >= 0; })
                                .map(function (line) { return line.split(/\s+/gi); })
                                .filter(function (values) { return values.length >= 2; })
                                .map(function (_a) {
                                var name = _a[0], state = _a[1], autostart = _a[2], groups = _a[3], ipv4 = _a[4], ipv6 = _a[5];
                                return ({ name: name, state: state, autostart: autostart, groups: groups, ipv4: ipv4, ipv6: ipv6 });
                            })];
                }
            });
        });
    };
    LXC.prototype._standardExec = function (command) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var output = '';
            var err = '';
            var cp = LXCTools.sysExec(command, _this.sshBind);
            cp.stdout.on('data', function (data) { return output += data; });
            cp.stderr.on('data', function (data) { return err += data; });
            cp.on('close', function (code) {
                if (code) {
                    return reject({
                        code: code,
                        err: err,
                        output: output
                    });
                }
                return resolve(output);
            });
        });
    };
    return LXC;
}());
exports.default = LXC;
