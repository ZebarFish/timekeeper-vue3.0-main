<template>
    <el-tooltip popper-class="tip-menu" ref="tooltip" v-model:visible="visible" content="Bottom center"
        placement="bottom-start" :raw-content='true' trigger="click" :show-arrow="false" virtual-triggering
        :virtual-ref="triggerRef">
        <template #content>
            <div class="tip-menu-content">
                <div v-for="(item, index) in tooltipBtns" :key="index" @click="menuClick">
                    {{ item.content }}</div>
            </div>
        </template>

    </el-tooltip>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import useSettingsStore from '@/stores/settings';

const emit = defineEmits(['mouseRightClick', 'menuClick'])
const props = defineProps({
    tooltipBtns: {
        type: Array,
        default: () => []
    },
    triggerDom: {
        type: String,
        default: ''
    }
})
const settings = useSettingsStore()

const visible = ref(false);
const triggerRef = ref({
    getBoundingClientRect() {
        return position.value
    },
})
const position = ref({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
})

// const theme = ref('dark');
// settings.$subscribe((mutation, state) => {
//     console.log(state.theme)
//     theme.value = state.theme
// })

let em = {}

const menuClick = (e) => {
    emit('menuClick', { text: e.target.innerText, dom: em })
}

onMounted(() => {
    document.addEventListener("mousedown", (e) => {
        if (e.button == 1) { //鼠标滚轮
        } else if (e.button == 2) { //鼠标右键
            em = e.target.closest(props.triggerDom)
            if (em) {
                visible.value = true
                nextTick(() => {
                    position.value = DOMRect.fromRect({
                        width: 0,
                        height: 0,
                        x: e.clientX,
                        y: e.clientY,
                    })
                })
                emit('mouseRightClick', em)
            }
            else {
                visible.value = false
            }
            e.preventDefault();
        } else {//鼠标左键
            visible.value = false
        }
        // e.preventDefault();
    });
})

</script>

<style lang="scss">
.tip-menu.el-popper {
    border: 0;
    box-shadow: 0 0 3px;
    background-color: var(--background-color);
    color: var(--el-color-font);
    padding: 0px;

    .tip-menu-content {
        font-size: 16px;
        line-height: 25px;
        margin: 5px 0px;
        cursor: pointer;

        div {
            padding: 5px 15px;
        }

        div:hover {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);

        }
    }

}
</style>