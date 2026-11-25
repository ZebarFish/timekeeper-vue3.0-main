import api from '@/api/api'
import { deepCopy } from '@/common/common'
import dayjs from 'dayjs'
import useArchiveStore from '@/stores/modules/archive'


const useMainStore = defineStore(
    'main', {
    state: () => ({
        mid: '',
        title: '',
        fleshTime: '',
        undoList: [],
        completeList: [],
    }),
    actions: {
        init(mid) {
            //只有mid变化才触发视图更新
            if (this.mid != mid) {
                //不循环触发视图更新
                // this.$patch((state) => {
                this.mid = mid
                this.title = api.getTodoById({ id: mid }).data.title
                this.undoList = api.getUndoList(mid).data
                this.completeList = api.getCompleteList(mid).data
                let time = api.getFleshTime(mid).data
                if (time < dayjs().format('YYYY-MM-DD')) {
                    this.fleshTime = dayjs().format('YYYY-MM-DD')
                }
                else {
                    this.fleshTime = time
                }
                // })
            }
        },

        setUndoList(list) {
            this.undoList = list
            api.saveUndoList(this.mid, this.undoList)
        },
        setCompleteList(list) {
            this.completeList = list
            api.saveCompleteList(this.mid, this.completeList)
        },
        setUndo(item) {
            let curNode = item
            if (!(curNode.id && curNode.level))
                curNode = this.getNodeByNameOrId(item)
            if (curNode && curNode.level == 2) {
                const parent = this.undoList.find(x => x.id == curNode.parentId)
                const index = parent.children.findIndex(x => x.id == item.id)
                if (index > -1) {
                    parent.children.splice(index, 1, item)
                }
                else {
                    parent.children.splice(0, 0, item)
                }
            }
            else {
                const index = this.undoList.findIndex(x => x.id == item.id)
                if (index > -1) {
                    this.undoList.splice(index, 1, item)
                }
                else {
                    this.undoList.splice(0, 0, item)
                }
            }

            api.saveUndoList(this.mid, this.undoList)
        },
        setComplete(item) {
            let curNode = item
            if (!(curNode.id && curNode.level))
                curNode = this.getNodeByNameOrId(item, 'completeList')
            if (curNode && curNode.level == 2) {
                const parent = this.completeList.find(x => x.id == curNode.parentId)
                const index = parent.children.findIndex(x => x.id == item.id)
                if (index > -1) {
                    parent.children.splice(index, 1, item)
                }
                else {
                    parent.children.splice(0, 0, item)
                }
            }
            else {
                const index = this.completeList.findIndex(x => x.id == item.id)
                if (index > -1) {
                    this.completeList.splice(index, 1, item)
                }
                else {
                    this.completeList.splice(0, 0, item)
                }
            }

            api.saveCompleteList(this.mid, this.completeList)
        },
        // 删除
        delUndo(id) {
            const curNode = this.getNodeByNameOrId({ id: id })
            if (curNode.level == 2) {
                const parent = this.undoList.find(x => x.id == curNode.parentId)
                const index = parent.children.findIndex(x => x.id == id)
                if (index > -1) {
                    parent.children.splice(index, 1)
                }
            }
            else {

                const index = this.undoList.findIndex(x => x.id == id)
                if (index > -1) {
                    this.undoList.splice(index, 1)
                }
            }

            api.saveUndoList(this.mid, this.undoList)
        },
        delComplete(id) {
            const curNode = this.getNodeByNameOrId({ id: id }, 'completeList')
            if (curNode.level == 2) {
                const parent = this.completeList.find(x => x.id == curNode.parentId)
                const index = parent.children.findIndex(x => x.id == id)
                if (index > -1) {
                    parent.children.splice(index, 1)
                }
            }
            else {
                const index = this.completeList.findIndex(x => x.id == id)
                if (index > -1) {
                    this.completeList.splice(index, 1)
                }
            }

            api.saveCompleteList(this.mid, this.completeList)
        },
        doComplete(item) {
            const curNode = this.getNodeByNameOrId(item)
            //孩子节点完成，在完成列表增加一个父节点
            if (curNode.level == 2) {
                const parent = this.undoList.find(x => x.id == curNode.parentId)
                if (!this.isParentExist('completeList', { id: curNode.parentId })) {
                    let copy = deepCopy(parent)
                    copy.children = []
                    this.setComplete(copy)
                }
                if (this.isParentExist('undoList', { id: curNode.parentId })
                    && parent.children.length <= 1
                ) {
                    this.delUndo(parent.id)
                }
            }
            this.setComplete(item)
            this.delUndo(item.id)
        },
        doUndo(item) {
            const curNode = this.getNodeByNameOrId(item, 'completeList')
            //孩子节点未完成，如果父节点没有子节点了，则删除父节点
            if (curNode.level == 2) {
                const parent = this.completeList.find(x => x.id == curNode.parentId)
                if (!this.isParentExist('undoList', { id: curNode.parentId })) {
                    let copy = deepCopy(parent)
                    copy.children = []
                    this.setUndo(copy)
                }
                if (this.isParentExist('completeList', { id: curNode.parentId })
                    && parent.children.length <= 1
                ) {
                    this.delComplete(parent.id)
                }
            }
            this.setUndo(item)
            this.delComplete(item.id)
        },
        clearCompleteList() {
            this.completeList = []
            api.saveCompleteList(this.mid, this.completeList)
        },
        clearUndoList() {
            this.undoList = []
            api.saveUndoList(this.mid, this.undoList)
        },
        archiveCompleted() {
            useArchiveStore().setArchiveList(deepCopy(this.getNodeList('completeList')))
            this.completeList = []
            api.saveCompleteList(this.mid, this.completeList)
        },
        getNodeByNameOrId(item, type = 'undoList') { //优先以id为准
            //根据id获取undo，包括children中获取
            if (this.isParentExist(type, item)) {
                let parent = item.id ? this[type].find(x => x.id == item.id) :
                    this[type].find(x => x.content == item.content)
                parent.level = 1
                return parent
            }
            else {
                const parent = item.id ? this[type].find(x => x.children && x.children.some(y => y.id == item.id)) :
                    this[type].find(x => x.children && x.children.some(y => y.content == item.content))
                let child = {}
                if (parent) {
                    child = parent.children.find(x => x.id == item.id || x.content == item.content)
                    child.parentId = parent.id
                    child.level = 2
                }
                return child
            }
        },
        getParentNodeById({ id }) {
            let parent = this.completeList.find(x => x.id == id)
            if (!parent)
                parent = this.undoList.find(x => x.id == id)
            return parent
        },
        getNodeList(type = 'undoList') {
            let tmp = []
            this[type].filter(x => (!x.children || x.children.length == 0)).map(x => {
                x.title = this.title
                tmp.push(x)
            })

            this[type].filter(x => x.children && x.children.length > 0).map(item => {
                item.children.map(y => {
                    y.parentContent = item.content
                    y.content = y.content
                    y.title = this.title
                    tmp.push(y)
                })
            })

            return tmp
        },
        isParentExist(type, item) { //判断是否已经存在，排除二级节点
            return this[type].some(x => x.id == item.id || x.content == item.content)
        },
        setFleshTime(time) {
            this.fleshTime = time
            api.saveFleshTime(this.mid, this.fleshTime)
        }
    }
})

export default useMainStore