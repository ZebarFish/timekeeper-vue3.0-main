export class BeginType {
    static Begin = 1;
    static Continue = 2;
    static End = 3;
}

/**
 * 异步返回成功消息
 */
export class Msg {
    Tag
    Message
    Data

    constructor(data, msg) {
        this.Message = msg
        this.Data = data
    }

    /**
     * 返回包含数据实例
     * @param {Object} data
     * @return {Msg}
     */
    static success(data = null) {
        let t = new Msg(data, null)
        t.Tag = 1
        return t
    }

    static error(message = null) {
        let t = new Msg(null, message)
        t.Tag = 0
        return t
    }
}

