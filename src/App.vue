<template>
  <div class="container">
    <div class="menu-left">
      <h-menu></h-menu>
    </div>
    <div class="menu-main">
      <div class="menu-main-content">

        <router-view v-slot="{ Component }">
          <transition name="slide-fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>

      </div>
    </div>
  </div>
</template>

<script setup>
import HMenu from '@/components/HMenu.vue'
import useSettingsStore from '@/stores/settings'
import { handleThemeStyle } from '@/utils/theme'
import { watch, ref, onMounted, nextTick } from 'vue'
import { transfer } from '@/common/transfer'

transfer()

const setting = useSettingsStore()
setting.init()

document.oncontextmenu = function () {
  return false;
}

onMounted(async () => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(setting.theme)
  })
})


</script>


<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  background-color: var(--el-color-background);

  .menu-content {
    height: 100vh;

  }

  .menu-main {
    width: 100%;
    height: 100vh;
    position: relative;
    font-weight: normal;

    .menu-main-content {
      padding: 10px 2rem;
      height: calc(100vh - 10px);
      overflow-y: auto;
    }
  }



}
</style>