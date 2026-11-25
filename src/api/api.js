import storage from '@/common/storage.js'
import { Msg } from '@/common/commonType'

import common, {
    date
} from "@/common/common.js"


const api = {
    getDataVersion() {
        return storage.getSync("dataVersion") || '1.0.0.0'
    },
    setDataVersion(param = '') {
        if (param)
            storage.setSync("dataVersion", param)
    },
    getTodoList(params = {}) {
        return { data: storage.getSync("todoList") || [] }
    },
    saveTodlList(params = {}) {
        storage.setSync("todoList", params)
    },
    getTodoById(params = {}) {
        let ret = {}
        let list = storage.getSync("todoList") || []
        if (list.length > 0) {
            // ret.index = list.findIndex(x => x.id == params.id)
            ret.data = list.find(x => x.mid == params.id)
        }
        return ret

    },
    getUndoListOld(params = {}) {
        return { data: storage.getSync("undoList") || [] }
    },
    removeUndoListOld(params = {}) {
        storage.removeSync("undoList")
    },
    getUndoList(key, params = {}) {
        return { data: storage.getSync("undoList-" + key) || [] }
    },
    getUndoListById(key, params = {}) {
        let ret = {}
        let list = storage.getSync("undoList-" + key) || []
        if (list.length > 0) {
            ret.index = list.findIndex(x => x.id == params.id)
            ret.data = list.find(x => x.id == params.id)
        }
        return ret
    },
    getCompleteListOld(params = {}) {
        return { data: storage.getSync("completeList") || [] }
    },
    removeCompleteListOld(params = {}) {
        storage.removeSync("completeList")
    },
    getCompleteList(key, params = {}) {
        return { data: storage.getSync("completeList-" + key) || [] }
    },
    getCompleteListById(key, params = {}) {
        let ret = {}
        let list = storage.getSync("completeList-" + key) || []
        if (list.length) {
            ret.index = list.findIndex(x => x.id == params.id)
            ret.data = list.find(x => x.id == params.id)
        }
        return ret
    },
    getFleshTime(key, params = {}) {
        return { data: storage.getSync("fleshTime-" + key) || '' }
    },
    saveFleshTime(key, params = {}) {
        storage.setSync("fleshTime-" + key, params)
    },
    removeFleshTime(key, params = {}) {
        storage.removeSync("fleshTime-" + key)
    },
    saveUndoList(key, params = {}) {
        storage.setSync("undoList-" + key, params)
    },
    removeUndoList(key, params = {}) {
        storage.removeSync("undoList-" + key)
    },
    saveCompleteList(key, params = {}) {
        storage.setSync("completeList-" + key, params)
    },
    removeCompleteList(key, params = {}) {
        storage.removeSync("completeList-" + key)
    },
    addUndoList(key, params = {}) {
        let list = storage.getSync("undoList") || []
        list.splice(0, 0, params)
        this.saveUndoList(key, list)
        return list
    },
    addCompleteList(key, params = {}) {
        let list = storage.getSync("completeList") || []
        list.splice(0, 0, params)
        this.saveCompleteList(key, list)
        return list
    },
    deleteUndoList(key, params = {}) {
        let list = storage.getSync("undoList-" + key) || []
        let index = params.index
        if (params.id) {
            index = list.findIndex(x => x.id == params.id)
        }
        if (index > -1) {
            list.splice(index, 1)
            this.saveUndoList(key, list)

        }
        return list
    },
    deleteCompleteList(key, params = {}) {
        let list = storage.getSync("completeList-" + key) || []
        let index = params.index
        if (params.id) {
            index = list.findIndex(x => x.id == params.id)
        }
        if (index > -1) {
            list.splice(index, 1)
            this.saveCompleteList(key, list)
        }
        return list
    },
    getSetting() {
        const todoType = this.getTodoType().data
        const workTime = this.getWorkTime().data
        const singleMode = this.getSingleMode().data
        const workTimeEnable = this.getWorkTimeEnable().data
        const theme = this.getTheme().data

        return {
            theme,
            todoType,
            workTime,
            singleMode,
            workTimeEnable
        }
    },
    saveSetting(params = {}) {
        this.saveTodoType(params.todoType)
        this.saveWorkTime(params.workTime)
        this.saveSingleMode(params.singleMode)
        this.saveWorkTimeEnable(params.workTimeEnable)
    },
    getArchiveList(params = {}) {
        return { data: storage.getSync("archiveList") || [] }
    },
    saveArchiveList(params = {}) {
        storage.setSync("archiveList", params)
    },
    getTheme(params = {}) {
        return { data: storage.getSync("theme") || 'light' }
    },
    saveTheme(params = {}) {
        storage.setSync("theme", params)
    },
    //待办分类配置
    getTodoType(params = {}) {
        return { data: storage.getSync("todoType") }
    },
    saveTodoType(params = {}) {
        storage.setSync("todoType", params)
    },
    //时间配置
    getWorkTime(params = {}) {
        return { data: storage.getSync("workTime") || ['', '', '', ''] }
    },
    getWorkTimeEnable(params = {}) {
        return { data: storage.getSync("workTimeEnable") || false }
    },
    saveWorkTime(params = {}) {
        storage.setSync("workTime", params)
    },
    saveWorkTimeEnable(params = {}) {
        storage.setSync("workTimeEnable", params)
    },
    getSingleMode(params = {}) {
        return { data: storage.getSync("singleMode") || false }
    },
    saveSingleMode(params = {}) {
        storage.setSync("singleMode", params)
    },
    //获取时间差
    getTimeDif(start, end, type = "") {
        if (!start || !end) {
            return 0
        }
        let workTimeEnable = this.getWorkTimeEnable().data
        let workTime = this.getWorkTime().data
        if (workTimeEnable && !workTime.some(item => !item)) {
            return common.worktimeStint(start, end, workTime, type)
        } else {
            return common.timeDif(start, end, type)
        }
    },
    worktimeConvert(stint, type) {
        return common.worktimeConvert(stint, type)
    },
    //完成耗时数
    getStint(params = {}) {
        let ret = {}
        ret.currentStint = storage.getSync("currentStint") || { key: '', value: 0 }
        ret.currentStintDetail = storage.getSync("currentStintDetail") || [{ id: '', stint: 0 }]
        return ret
    },
    saveCurrentStint(params = {}) {
        storage.setSync("currentStint", params.currentStint)
        storage.setSync("currentStintDetail", params.currentStintDetail)
    },
    removeCurrentStint(params = {}) {
        let id = params.id
        let { currentStint, currentStintDetail } = this.getStint()
        let index = currentStintDetail.findIndex(x => x.id == id)
        if (index > -1) {
            let tmp = currentStintDetail.find(x => x.id == id)
            tmp.stint = 0
            let sum = 0
            currentStintDetail.map(item => {
                sum += item.stint
            })
            currentStint.value = sum
            this.saveCurrentStint({ currentStint, currentStintDetail })
        }
        return { currentStint, currentStintDetail }
    },
    getCurrentStint(params = {}) {
        let { id, stint } = params
        let { currentStint, currentStintDetail } = this.getStint()
        if (currentStint.key == common.dayjs(new Date()).format('YYYY-MM-DD')) {
            let index = currentStintDetail.findIndex(x => x.id == id)
            let tmp = {}
            if (index > -1) {
                tmp = currentStintDetail.find(x => x.id == id)
                tmp.stint = stint
            }
            else {
                tmp = { id: id, stint: stint }
                currentStintDetail.push(tmp)
            }
            let sum = 0
            currentStintDetail.map(item => {
                sum += item.stint
            })
            currentStint.value = sum
        }
        else {
            currentStintDetail = [{ id: id, stint: stint }]
            currentStint = { key: common.dayjs(new Date()).format('YYYY-MM-DD'), value: stint }
        }
        this.saveCurrentStint({ currentStint, currentStintDetail })
        return { currentStint, currentStintDetail }
    },

    //完成项目数
    getComplete(params = {}) {
        let ret = {}
        ret.completeCount = storage.getSync("completeCount") || { key: '', value: 0 }
        ret.completeCountDetail = storage.getSync("completeCountDetail") || []
        return ret
    },
    saveCompleteCount(params = {}) {
        storage.setSync("completeCount", params.completeCount)
        storage.setSync("completeCountDetail", params.completeCountDetail)
    },
    removeCompleteCount(params = {}) {
        let id = params.id
        let { completeCount, completeCountDetail } = this.getComplete()
        let index = completeCountDetail.findIndex(x => x == id)
        if (index > -1) {
            completeCountDetail.splice(index, 1)
            completeCount.value = completeCountDetail.length
        }
        this.saveCompleteCount({ completeCount, completeCountDetail })
        return { completeCount, completeCountDetail }
    },
    getCompleteCount(params = {}) {
        let id = params.id
        let { completeCount, completeCountDetail } = this.getComplete()
        if (completeCount.key == common.dayjs(new Date()).format('YYYY-MM-DD')) {
            let index = completeCountDetail.findIndex(x => x == id)
            if (index == -1) {
                completeCountDetail.push(id)
                completeCount.value = completeCountDetail.length
            }
        }
        else {
            completeCountDetail = [id]
            completeCount = { key: common.dayjs(new Date()).format('YYYY-MM-DD'), value: 1 }
        }
        this.saveCompleteCount({ completeCount, completeCountDetail })
        return { completeCount, completeCountDetail }
    },
    clearCurrentStintAndComplete() {
        console.log("定时清理", new Date())
        let { currentStint, currentStintDetail } = this.getStint()
        if (currentStint.key == "" || currentStint.key != common.dayjs(new Date()).format('YYYY-MM-DD')) {
            currentStintDetail = [{ id: '', stint: 0 }]
            currentStint = { key: common.dayjs(new Date()).format('YYYY-MM-DD'), value: 0 }
            this.saveCurrentStint({ currentStint, currentStintDetail })
        }
        let { completeCount, completeCountDetail } = this.getComplete()
        if (completeCount.key == "" || completeCount.key != common.dayjs(new Date()).format('YYYY-MM-DD')) {
            completeCountDetail = []
            completeCount = { key: common.dayjs(new Date()).format('YYYY-MM-DD'), value: 0 }
            this.saveCompleteCount({ completeCount, completeCountDetail })
        }
        return { currentStint, currentStintDetail, completeCount, completeCountDetail }
    },
    uploadImage(params = {}) {
        return storage.uploadFile(params.file, params.mid, params.type)
    },
    getImage(params = {}) {
        return storage.getFile(params.mid)
    },
    getImageSync(params = {}) {
        return storage.getFileSync(params.mid)
    },
    removeImage(params = {}) {
        storage.removeFile(params.mid)
    }
}

export default api;