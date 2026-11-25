import api from '@/api/api'
import dayjs from 'dayjs'
import { deepCopy } from '@/common/common'


const useArchiveStore = defineStore(
    'archive', {
    state: () => ({
        archiveList: [],
    }),
    actions: {
        init() {
            if (this.archiveList.length === 0)
                this.archiveList = api.getArchiveList().data || []
        },
        setArchive(item) {
            const index = this.archiveList.findIndex(x => x.mid === item.mid)
            if (index >= 0) {
                this.archiveList.splice(index, 1, item)
            } else {
                this.archiveList.splice(0, 0, item)
            }
            api.saveArchiveList(this.archiveList)
        },
        setArchiveList(list) {
            list.forEach(item => {
                item.pauseCount = (item.pauseStartfulltime && item.pauseStartfulltime.length) || 0
                item.createTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
            })
            this.archiveList.unshift(...list)
            api.saveArchiveList(this.archiveList)
        },
        delArchiveList(ids) {
            this.archiveList = this.archiveList.filter(x => !ids.includes(x.id))
            api.saveArchiveList(deepCopy(this.archiveList))
        },
    }
})

export default useArchiveStore