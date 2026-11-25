import api from '@/api/api'
import dayjs from 'dayjs'
import imagePath from '@/assets/bg.jpeg'

const useHomeStore = defineStore(
    'home', {
    state: () => ({
        mid: '',
        // title:'',
        // imageUrl:'',
        todoList: [],
    }),
    actions: {
        init() {
            this.todoList = api.getTodoList().data || []
            if (this.todoList.length === 0) {
                this.todoList.push({
                    mid: '1',
                    title: '我的待办',
                    imageUrl: imagePath
                })
                api.saveTodlList(this.todoList)
            }
            else {

                this.todoList.forEach(item => {
                    api.getImage({ mid: item.mid }).then(res => {
                        item.imageUrl = res || imagePath
                    })
                })
            }
            this.mid = this.mid || (this.todoList.length > 0 ? this.todoList[0].mid : '')
        },
        getTodoById(mid) {
            return this.todoList.find(x => x.mid === mid)
        },
        setTodo(item) {
            const index = this.todoList.findIndex(x => x.mid === item.mid)
            if (index >= 0) {
                this.todoList.splice(index, 1, item)
            } else {
                this.todoList.push(item)
            }
            api.saveTodlList(this.todoList)
        },
        delTodo(mid) {
            const index = this.todoList.findIndex(x => x.mid === mid)
            this.todoList.splice(index, 1)
            api.saveTodlList(this.todoList)
            this.delImage()

            //需要删除所有待办
            api.removeCompleteList(mid)
            api.removeUndoList(mid)
            api.removeFleshTime(mid)
        },
        getImage() {
            return api.getImage({ mid: this.mid })
        },
        delImage() {
            api.removeImage({ mid: this.mid })
        },
        uploadImage(data) {
            return api.uploadImage({ file: data.file, mid: data.mid, type: data.file.type })
        }
    }
})

export default useHomeStore