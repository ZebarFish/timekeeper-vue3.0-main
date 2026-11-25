<template>
    <div class="home-container">
        <div class="home-header">
            <div class="home-header-left"><span
                    style="font-size: 18px;font-weight: bold;margin-right: 10px;">待办列表</span>
                <span>{{
                    todoList.length || '' }}</span>
            </div>
            <div class="home-header-right">
                <!-- <el-icon @click="$router.push('/archive')" :size="20" title="归档列表">
                    <Files />
                </el-icon> -->
            </div>
        </div>
        <el-divider style="margin:5px 0px 15px 0px;" />

        <div class="home-card">
            <card v-for="(item, index) in todoList" :key="index" :data="item" @remove="removeTodo(item.mid)"></card>

            <card :isAdd="true" :data="{ title: '创建待办' }" @click="openTodo"></card>
        </div>
        <el-dialog v-model="dialogVisible" title="创建待办" width="500" :before-close="handleClose">

            <div>
                <el-form ref="formRef" :model="form" class="el-form-upload" label-width="100px" :rules="rules"
                    label-position="top">

                    <el-form-item label="" prop="imageUrl">
                        <cropper v-model:imageUrl="form.imageUrl" @UploadSuccess="UploadSuccess"></cropper>
                    </el-form-item>
                    <el-form-item label="待办标题" required prop="title">
                        <el-input v-model="form.title"></el-input>
                    </el-form-item>

                </el-form>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="cancel(formRef)">取消</el-button>
                    <el-button type="primary" @click="save(formRef)">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <context-menu @menuClick="menuClick" trigger-dom=".card-container.card-editable"
            :tooltip-btns="tooltipBtns"></context-menu>
    </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, toRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Card from '@/components/Card.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import useHomeStore from '@/stores/modules/home'
import common, { deepCopy } from '@/common/common'
import Cropper from '@/components/Cropper'
import imagePath from '@/assets/bg.jpeg'

const homeStore = useHomeStore();
const todoList = computed(() => homeStore.todoList)

let tooltipBtns = ref([{ content: '编辑' }, { content: '删除' }])
const dialogVisible = ref(false)
const formRef = ref()
let form = reactive({
    title: '',
    mid: '',
    imageUrl: imagePath
})
const rules = reactive({
    title: [
        { required: true, message: '请填写待办标题', trigger: 'blur' }
    ],
})

onMounted(() => {
    homeStore.init()
})

function cancel(formEl) {
    dialogVisible.value = false
    clear()
    formEl.resetFields()
}
function removeTodo(mid) {
    ElMessageBox.confirm(
        '你确定要删除待办吗?',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        homeStore.delTodo(mid)

        ElMessage({
            type: 'success',
            message: '删除成功',
        })
    }).catch(() => {
    })
}
function clear() {
    form.title = ''
    form.imageUrl = ''
    form.mid = ''
}
function openTodo() {
    form.title = ''
    form.imageUrl = imagePath
    form.mid = common.uuid()
    // homeStore.mid = form.mid
    dialogVisible.value = true
}
let todo_image = null
async function save(formEl) {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            form.mid = form.mid || common.uuid()
            homeStore.mid = form.mid
            form.imageUrl = form.imageUrl || imagePath
            if (todo_image) {
                homeStore.uploadImage({ file: todo_image, mid: form.mid })
            }
            homeStore.setTodo(deepCopy(toRaw(form)))
            dialogVisible.value = false
            clear()
        }
        else {
            console.log('error submit!', fields)
        }
    })
}

function UploadSuccess(file) {
    todo_image = file
    // let tmp = homeStore.uploadImage({ file: file, mid: form.mid })
    console.log(file)
}

function handleClose(done) {
    console.log('close')
    done()
}

function menuClick(data) {
    console.log(data)
    if (data.text == '编辑') {
        homeStore.mid = data.dom.id
        const todo = homeStore.getTodoById(homeStore.mid)
        form.title = todo.title
        // form.imageUrl = todo.imageUrl
        form.mid = todo.mid
        homeStore.getImage().then(res => {
            form.imageUrl = res || imagePath
            dialogVisible.value = true

        }).catch((err) => {
            form.imageUrl = imagePath
            dialogVisible.value = true
        })
    }
    else if (data.text == '删除') {
        removeTodo(data.dom.id)
    }

}


</script>

<style lang="scss">
.home-container {
    .home-header {
        display: flex;
        justify-content: space-between;
        margin: 10px 0px;
    }

    .home-card {
        display: flex;
        flex-wrap: wrap;

    }

    .home-header-right {
        display: flex;
        align-items: center;

        .el-icon {
            cursor: pointer;
            margin-right: 10px;
        }
    }

    .el-form-upload {
        padding: 10px;
    }


}
</style>