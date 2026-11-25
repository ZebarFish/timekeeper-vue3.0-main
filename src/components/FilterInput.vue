<template>
    <div class="todo">
        <el-popover popper-class="todo-popper" placement="top-start" :show-arrow="false" :width="300" :visible="show">
            <template #reference>
                <el-input v-model="modelValue.content" class="todo--input" @click="click" @blur="blur"
                    placeholder="Tab选中待办分类，--多级待办，Enter新增待办"></el-input>
            </template>
            <div class="todo-line" v-for="(item, index) in filterList" :key="index">
                <span>{{ item.fType }}</span>
                <span class="todo-line-remark">{{ 'Ctrl+' + (index + 1) }}</span>
            </div>

        </el-popover>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import useSettingsStore from '@/stores/settings'

const setting = useSettingsStore()

const props = defineProps({
    content: { type: Object, default: {} }
})
const emit = defineEmits(['enter', 'tab', 'click']);

let show = ref(false)
let isActive = ref(false)
let modelValue = reactive(props.content)
let filterList = ref([])
const gridData = computed(() => setting.todoType.replace(/；/g, ';').split(';').filter(item => item).map(item => ({ fType: item })))


watch(
    () => setting.todoType,
    (newVal) => {
        let filter = modelValue.content.toLocaleLowerCase().replace('【', '').replace('】', '')
        filterList.value = gridData.value.filter(item => item.fType.toLowerCase().includes(filter)).sort((a, b) => {
            return b.fType.length - a.fType.length
        }).slice(0, 5)
    }
)

watch(modelValue, (val) => {
    //取前5条
    let filter = val.content.toLocaleLowerCase().replace('【', '').replace('】', '') || undefined
    filterList.value = gridData.value.filter(item => item.fType.toLowerCase().includes(filter)).sort((a, b) => {
        return b.fType.length - a.fType.length
    }).slice(0, 5)
    if (filterList.value.length > 0) {
        show.value = true
    }
    else {
        show.value = false
    }
})

onMounted(() => {
    //添加按键监听
    document.addEventListener("keydown", (event) => {
        if (isActive.value) {
            keyHandle(event)

        }
    })
})

function click() {
    isActive.value = true
    emit('click')
}

function blur() {
    show.value = false
    isActive.value = false
}

function keyHandle(event) {
    if (event.key == 'Enter') {
        emit('enter', modelValue)
        modelValue.content = ''
        event.preventDefault();
    }
    else if (event.key == 'Tab') {
        //判断filter列表是否存在，是则Tab输入
        let filter = modelValue.content.toLocaleLowerCase().replace('【', '').replace('】', '')
        if (filterList.value.some(item => item.fType.toLocaleLowerCase().includes(filter))) {
            let filterContent = filterList.value[filterList.value.length - 1].fType
            modelValue.content = "【" + filterContent + "】"
            emit('tab', modelValue.content)
        }
        event.preventDefault();
    }
    else if (event.ctrlKey && ['1', '2', '3', '4', '5'].includes(event.key)) {
        let curFilter = filterList.value[event.key - 1]
        if (curFilter) {
            let filterContent = curFilter.fType
            modelValue.content = "【" + filterContent + "】"
            emit('tab', modelValue.content)
        }
        event.preventDefault();

    }

}


</script>

<style lang="scss">
.todo {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    left: 2rem;
    z-index: 999;
    display: flex;
    align-items: center;
    background-color: var(--el-color-background);

    .el-input {
        box-shadow: 0 0 5px 0;
    }

    .el-input__wrapper {
        border-radius: 0px;
    }

    .el-input__wrapper.is-focus {
        box-shadow: none;
    }

    .el-input__inner {
        height: 42px;
        line-height: 42px;
        font-size: 16px;
    }




}

.todo-popper {
    .el-table--default .cell {
        padding: 0px;
    }

    .todo-line {

        line-height: 25px;
        font-size: 16px;
        display: flex;
        justify-content: space-between;

        span {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            width: 100%;
            overflow: hidden;
        }

        .todo-line-remark {
            font-size: 12px;
            width: 45px;

        }
    }
}
</style>