import api from '@/api/api'
import { deepCopy } from '@/common/common'

const useSettingsStore = defineStore(
    'settings',
    {
        state: () => ({
            theme: 'light',
            singleMode: false,
            todoType: '',
            workTime: [],
            workTimeEnable: false,
            historyLoad: []
        }),
        actions: {
            init() {
                const setting = api.getSetting()
                this.theme = setting.theme
                this.singleMode = setting.singleMode
                this.todoType = setting.todoType
                this.workTime = setting.workTime
                this.workTimeEnable = setting.workTimeEnable
            },
            getTodoType() {
                return this.todoType.split(';')
            },
            setTheme(val) {
                this.theme = val
                api.saveTheme(val)
            },
            setSetting() {
                const data = deepCopy(this.$state)
                // this.singleMode = data.singleMode
                // this.todoType = data.todoType
                // this.workTime = data.workTime
                // this.workTimeEnable = data.workTimeEnable
                api.saveSetting(data)
            }
        }
    })

export default useSettingsStore