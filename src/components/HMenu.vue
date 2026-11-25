<template>
    <el-menu default-active="2" class="menu-content" :collapse="true" @close="handleClose">
        <div class="top">
            <el-menu-item index="1" @click="$router.push('/home')">
                <div class="svg-div">
                    <svg-icon name="home" style="height: 2em;width: 2em;"></svg-icon>

                </div>
                <template #title>首页</template>
            </el-menu-item>
        </div>
        <div class="middle">
            <el-menu-item index="2" @click="$router.push('/')">
                <el-icon>
                    <ChatDotSquare />
                </el-icon>
                <template #title>当前待办</template>
            </el-menu-item>
            <el-menu-item index="2" @click="$router.push('/archive')">
                <el-icon>
                    <Files />
                </el-icon>
                <template #title>归档列表</template>
            </el-menu-item>
            <el-menu-item index="3" :disabled="!prevTodo.mid" @click="$router.push(`/${prevTodo.mid || ''}`)">
                <el-icon>
                    <Back />
                </el-icon>
                <template #title>{{ prevTodo.title || '前一个待办' }}</template>
            </el-menu-item>
            <el-menu-item index="4" :disabled="!nextTodo.mid" @click="$router.push(`/${nextTodo.mid || ''}`)">
                <el-icon>
                    <Right />
                </el-icon>
                <template #title>{{ nextTodo.title || '后一个待办' }}</template>
            </el-menu-item>
        </div>
        <div class="middle">
            <!-- <el-menu-item index="2" @click="archiveCompleted">
                <el-icon>
                    <Lock />
                </el-icon>
                <template #title>归档已完成</template>
            </el-menu-item>
            <el-menu-item index="3" @click="clearCompleted">
                <svg-icon name="clear"></svg-icon>

                <template #title>清理已完成</template>
            </el-menu-item>
            <el-menu-item index="4" @click="exportExcel">
                <svg-icon name="excel"></svg-icon>
                <template #title>导出Excel</template>
            </el-menu-item> -->
        </div>
        <div class="bottom">
            <el-menu-item index="5">

                <el-switch class="theme-switch" v-model="themeSwitch"
                    style="--el-switch-on-color: #2c2c2c; --el-switch-off-color:#f2f2f2;--el-switch-border-color: var(--border-color);"
                    @change="themeChange">
                    <template #active-action>
                        <svg-icon class="custom-active-action dark-icon" name="dark"></svg-icon>
                    </template>
                    <template #inactive-action>
                        <svg-icon class="custom-inactive-action light-icon" name="light"></svg-icon>
                    </template>
                </el-switch>

                <template #title>主题</template>
            </el-menu-item>
            <el-menu-item index="6" @click="$router.push('/help')">
                <svg-icon name="help" style="height: 1.2em;width: 1.2em;"></svg-icon>

                <template #title>帮助中心</template>
            </el-menu-item>
            <el-menu-item index="7" @click="$router.push('/setting')">
                <el-icon>
                    <Setting />
                </el-icon>
                <template #title>更多设置</template>
            </el-menu-item>
        </div>
    </el-menu>
</template>

<script lang="ts" setup>
import { handleThemeStyle } from '@/utils/theme'
import { watch, ref, onMounted, nextTick, computed } from 'vue'
import useSettingsStore from '@/stores/settings'
import useHomeStore from '@/stores/modules/home'
import useMainStore from '@/stores/modules/main'

const setting = useSettingsStore()
const mainStore = useMainStore()
const themeSwitch = ref(setting.theme == 'dark')
const homeStore = useHomeStore()

let dialogVisible = ref(false)
let dialogContent = ref('')

onMounted(() => {
    homeStore.init()
})

watch(() => themeSwitch.value, (val) => {
    // setting.theme = val ? 'dark' : 'light'
    setting.setTheme(val ? 'dark' : 'light')
    handleThemeStyle(setting.theme)

})

const isCollapse = ref(true)
const prevTodo = computed(() => {
    let curmid = homeStore.mid
    const index = homeStore.todoList.findIndex(item => item.mid == curmid)
    if (index > 0) {
        return homeStore.todoList[index - 1]
    }
    else {
        return {}
    }
})


const nextTodo = computed(() => {
    let curmid = homeStore.mid
    const index = homeStore.todoList.findIndex(item => item.mid == curmid)
    if (index > -1 && index < homeStore.todoList.length - 1) {
        return homeStore.todoList[index + 1]
    }
    else {
        return {}
    }
})
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}

const themeChange = (val: boolean) => {
    setting.setTheme(val ? 'dark' : 'light')
}


</script>

<style lang="scss">
.menu-content.el-menu--collapse {
    width: 52px;
}

.menu-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 20px;

    .el-switch__core .el-switch__action {
        background-color: inherit;
    }

    .el-menu-item .el-menu-tooltip__trigger {
        padding: 0 15px;
        justify-content: center;
    }

    .el-menu-item [class^=el-icon] {
        margin-right: 0px;
    }

    .el-icon svg {
        height: 1em;
        width: 1em;
        color: var(--svg-color);
    }

    .el-switch .svg-icon {
        height: 1em;
        width: 1em;
    }

    .svg-icon {

        color: var(--svg-color);
    }

    .svg-div {
        width: 100%;
        display: flex;
        justify-content: center;
    }
}
</style>