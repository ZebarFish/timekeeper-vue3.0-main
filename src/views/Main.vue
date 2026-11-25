<template>
  <div class="main">
    <div class="main-title">
      <div class="main-title-left">
        <div class="main-title-text">{{ mainData.title }}</div>
        <div class="main-title-total">
          <el-icon :size="20" color="#409EFF" @click="refreshCompleteInfo">
            <Refresh />
          </el-icon>
          <div style="margin-left:3px;">
            今日完成事项{{ curCompleteInfo.completeCount }}个，完成工时{{ curCompleteInfo.completeStint.toFixed(1) }}分
          </div>
        </div>
      </div>

      <div class="main-title-right">

        <span title="导出Excel" class="main-title-right-icon" @click="exportExcel">
          <svg-icon name="excel"></svg-icon>

        </span>
        <span title="清理已完成" class="main-title-right-icon" @click="clearCompleted">
          <!-- <el-icon>
            <Delete />
          </el-icon> -->
          <svg-icon name="clear"></svg-icon>


        </span>
        <span title="归档已完成" class="main-title-right-icon" @click="archiveCompleted">
          <el-icon class="t1">
            <Files />
          </el-icon>

        </span>
      </div>
    </div>
    <el-divider style="margin:5px 0px 10px 0px;" />
    <div class="main-collapse">
      <el-collapse v-model="undoActive">
        <el-collapse-item :title="'未完成' + ' ' + calTotal(undoList)" name="1">
          <el-tree ref="undoTree" :data="undoList" draggable node-key="id" @node-drop="handleNodeDrop"
            :allow-drop="handleAllowDrop">
            <template #default="{ data }">
              <div class="flex" @click="undoIconClick(data)" v-if="!hasChildren(data) && !data.editable">
                <el-icon v-if="data.beginType === BeginType.Begin" :size="26" color="#409EFF">
                  <VideoPlay />
                </el-icon>
                <el-icon v-else-if="data.beginType === BeginType.Continue" :size="26" color="#F56C6C">
                  <VideoPlay />
                </el-icon>
                <svg-icon v-else name="square" style="height: 26px; width: 26px;"></svg-icon>

              </div>
              <div class="list-content" :id="data.id" type="undo">
                <el-input ref="undoInput" v-if="data.editable" v-model="data.content"
                  @blur="undoInputBlur(data)"></el-input>
                <span :class="[data.level != 2 ? 'list-content-span' : 'list-content-span-sub']" v-else>{{ data.content
                  }}</span>
                <div :class="[data.level != 2 ? 'list-content-time' : 'list-content-time-sub']"
                  v-if="!hasChildren(data)">
                  <div class="list-content-time-stint" @click="stintClick(data, 'undo')"
                    v-if="data.stint && data.stint.length > 0">
                    <div class="list-content-time-begin">工时：{{ data.stint }}</div>
                  </div>
                  <div class="list-content-time-span">
                    <div v-if="data.starttime" :title="'开始时间 ' + data.startfulltime" class="list-content-time-begin">{{
          data.starttime }}
                    </div>
                    <div v-if="data.endtime" :title="'结束时间 ' + data.endfulltime" class="list-content-time-begin">{{
          data.endtime }}</div>
                  </div>
                </div>
                <a class="flex list-content-add" v-if="data.level != 2" @click="appendChild($event, data)">
                  <el-icon :size="25" color="#409EFF">
                    <CirclePlus />
                  </el-icon>
                </a>

              </div>
            </template>
          </el-tree>
        </el-collapse-item>
      </el-collapse>
      <el-collapse v-model="completeActive" style="margin-top:20px;">
        <el-collapse-item :title="'已完成' + ' ' + calTotal(completeList)" name="1">
          <el-tree :data="completeList" node-key="id">
            <template #default="{ data }">
              <div class="flex" @click="completeIconClick(data)" v-if="!hasChildren(data)">
                <svg-icon name="checkfill" style="height: 26px; width: 26px;"></svg-icon>
              </div>
              <div class="list-content" :id="data.id" type="complete">
                <span class="list-content-span">{{ data.content }}</span>
                <div class="list-content-time" v-if="!hasChildren(data)" style="margin-right: 10px;">
                  <div class="list-content-time-stint" @click="stintClick(data, 'complete')"
                    v-if="data.stint && data.stint.length > 0">
                    <div class="list-content-time-begin">工时：{{ data.stint }}</div>
                  </div>
                  <div class="list-content-time-span">
                    <div v-if="data.starttime" :title="'开始时间 ' + data.startfulltime" class="list-content-time-begin">{{
          data.starttime }}
                    </div>
                    <div v-if="data.endtime" :title="'结束时间 ' + data.endfulltime" class="list-content-time-end">{{
          data.endtime }}</div>
                  </div>
                </div>
              </div>
            </template>
          </el-tree>
        </el-collapse-item>
      </el-collapse>
    </div>
    <filter-input :content="content" @enter="enter"></filter-input>
    <context-menu @mouse-right-click="mouseRightClick" @menuClick="menuClick" trigger-dom=".list-content"
      :tooltip-btns="tooltipBtns"></context-menu>
    <dialog-stint v-model:dialogShow="dialogStintShow" :node="dialogStintNode"
      @confirm="dialogStintConfirm"></dialog-stint>

  </div>
</template>

<script setup>
import { onMounted, ref, computed, reactive, watch, getCurrentInstance, nextTick, proxyRefs, onUpdated } from 'vue'
import { BeginType } from '@/common/commonType'
import FilterInput from '@/components/FilterInput.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import DialogStint from '@/components/DialogStint.vue'
import common from '@/common/common'
import useMainStore from '@/stores/modules/main'
import useHomeStore from '@/stores/modules/home'
import useSettingsStore from '@/stores/settings';
import dayjs from 'dayjs'
import { sheetExport } from '@/utils/excel.js'
import { confirm, alert } from '@/utils/alert'


const mainData = useMainStore()
const settings = useSettingsStore()
const separator = '--'

const proxy = getCurrentInstance()

let undoActive = ref(['1'])
let completeActive = ref([])
let tooltipBtns = ref([])
let undoInputActive = ref(false)
let dialogStintShow = ref(false)
let dialogStintNode = ref({})

let content = reactive({
  id: '',
  content: ''
})

const undoList = computed(() => mainData.undoList)
const completeList = computed(() => mainData.completeList)
const curCompleteInfo = computed(() => {
  let completeCount = 0, completeStint = 0
  mainData.completeList.filter(x => (!x.children || x.children.length == 0) && x.endfulltime > mainData.fleshTime).forEach(item => {
    completeCount++
    completeStint += item.stintm
  })

  mainData.completeList.filter(x => x.children && x.children.length > 0).forEach(item => {
    item.children.filter(x => x.endfulltime > mainData.fleshTime).forEach(citem => {
      completeCount++
      completeStint += citem.stintm
    })
  })

  return { completeCount, completeStint }
})


const props = defineProps({
  mid: String
})

onMounted(() => {
  const mid = useHomeStore().mid
  mainData.init(mid)
})


onUpdated(() => {
  //测试 1715308111014;
  const mid = props.mid || useHomeStore().mid
  mainData.init(mid)
  //记录当前
  useHomeStore().mid = mid


})

const refreshCompleteInfo = () => {
  mainData.setFleshTime(dayjs().format('YYYY-MM-DD HH:mm:ss'))
}

const mouseRightClick = (dom) => {
  calbtns({ id: dom.id, type: dom.getAttribute("type") })
}

const calbtns = ({ id, type }) => {
  let data = mainData.getNodeByNameOrId({ id: id })

  if (data.id && type == "undo") {
    if (data.beginType == BeginType.Begin || !data.beginType) {
      tooltipBtns.value = [{ type: type, content: '编辑' }, { type: type, content: '删除' }]
    }
    else if (data.beginType == BeginType.End) {
      tooltipBtns.value = [{ type: type, content: '编辑' }, { type: type, content: '暂停' }, { type: type, content: '重置' }, { type: type, content: '删除' }]
    }
    else {
      tooltipBtns.value = [{ type: type, content: '编辑' }, { type: type, content: '重置' }, { type: type, content: '删除' }]
    }
  }
  else if (mainData.getNodeByNameOrId({ id: id }, 'completeList').id && type == "complete") {
    tooltipBtns.value = [{ type: type, content: '重置' }, { type: type, content: '删除' }]

  }

}

const calTotal = (list) => {
  let total = 0
  list.forEach(item => {
    if (item.children.length > 0) {
      total += item.children.length
    }
    else {
      total += 1
    }
  })
  return total
}

const hasChildren = (data) => {
  let parent = mainData.getParentNodeById({ id: data.id })
  return parent && parent.children && parent.children.length > 0
}

//拖拽完成后更新undoList
const handleNodeDrop = (draggingNode, dropNode, type, event) => {
  if (type == 'inner') {
    let parentId = dropNode.data.id
    let childId = draggingNode.data.id
    let parentData = mainData.getNodeByNameOrId({ id: parentId })
    let childData = mainData.getNodeByNameOrId({ id: childId })

    parentData.level = 1
    childData.level = 2

    mainData.setUndoList(undoList.value)
  }
  else {
    //子节点拖拽到根节点
    let childId = draggingNode.data.id
    let childData = mainData.getNodeByNameOrId({ id: childId })

    childData.level = dropNode.level
    mainData.setUndoList(undoList.value)

  }
}

//控制最大层级为2
const handleAllowDrop = (draggingNode, dropNode, type) => {
  if (type == "inner" && (dropNode.level == 2 || (draggingNode.data.children && draggingNode.data.children.length > 0))) {
    return false
  }
  else {
    return true
  }
}

const enter = (data) => {

  if (data.content.indexOf(separator) > -1) {
    let parentConent = data.content.split(separator)[0] || ''
    let childContent = data.content.split(separator)[1] || ''
    let pid = ''
    if (!mainData.isParentExist('undoList', { id: data.id, content: parentConent })) {
      pid = common.uuid()
      mainData.setUndo({
        id: pid,
        content: parentConent,
        beginType: BeginType.Begin,
        createtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        editable: false,
        level: 1,
        children: [],
      })
    }

    if (mainData.isParentExist('undoList', { id: pid, content: parentConent })) {
      let undoData = mainData.getNodeByNameOrId({ id: pid, content: parentConent })
      let children = undoData.children || []
      children.push({
        id: common.uuid(),
        content: childContent,
        beginType: BeginType.Begin,
        createtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        editable: false,
        level: 2,
        children: [],
        parentId: undoData.id,
      })
      undoData.children = children
      mainData.setUndo(undoData)
      clearContent()
    }
  }
  else {
    mainData.setUndo({
      id: common.uuid(),
      content: data.content,
      beginType: BeginType.Begin,
      createtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      editable: false,
      level: 1,
      children: [],
    })
  }
  //展开树节点
  //proxy.$refs.undoTree.store.nodesMap[data.id].expanded = true
  undoActive.value = ['1']
}

const clearContent = () => {
  content.id = ''
  content.content = ''
}


const appendChild = (event, data) => {
  content.id = data.id
  content.content = data.content + separator
  nextTick(() => {
    document.querySelector('.todo--input .el-input__inner').click()
  })
  //阻止冒泡
  event.stopPropagation()
}

const removeChild = (data) => {
  data.children = []

  mainData.setUndo({
    id: common.uuid(),
    content: data,

    children: [],
  })
}

//添加enter事件
const undoInputEventHander = (event) => {
  if (undoInputActive.value) {
    if (event.key == 'Enter') {
      document.querySelector('.list-content .el-input__inner').blur()
    }
  }
}

const undoInputAddListener = () => {
  const inputDom = document.querySelector('.list-content .el-input__inner')
  inputDom.addEventListener("keydown", undoInputEventHander)
}

const undoInputRemoveListener = () => {
  //删除监听事件
  const inputDom = document.querySelector('.list-content .el-input__inner')
  inputDom.removeEventListener("keydown", undoInputEventHander)
}


const undoInputBlur = (data) => {
  data.editable = false
  undoInputActive.value = false
  mainData.setUndo(data)
  let complete = mainData.completeList.find((item) => item.id == data.id)
  if (complete) {
    complete.content = data.content
    mainData.setComplete(complete)
  }
  undoInputRemoveListener()
}

const menuClick = (obj) => {
  let node = {}
  let data = { id: obj.dom.id, type: obj.dom.getAttribute("type"), text: obj.text }
  if (data.type == 'undo') {
    node = mainData.getNodeByNameOrId(data)
  }
  else {
    node = mainData.getNodeByNameOrId(data, 'completeList')
  }

  if (data.text == '编辑') {

    node.editable = true
    undoInputActive.value = true

    nextTick(() => {
      proxy.refs.undoInput.focus()
      undoInputAddListener()
    })

    if (data.type == 'undo') {
      mainData.setUndo(node)

    }
    else {
      mainData.setComplete(node)
    }
  }
  else if (data.text == '重置') {
    node.beginType = BeginType.Begin
    node.starttime = ''
    node.startfulltime = ''
    node.endtime = ''
    node.endfulltime = ''
    node.stint = 0
    node.stintm = 0
    node.pauseStartfulltime = []
    node.pauseEndfulltime = []

    calStint(node)
    if (data.type == 'undo') {
      mainData.setUndo(node)

    }
    else {
      // mainData.setComplete(node)
      mainData.doUndo(node)
    }
  }
  else if (data.text == '暂停') {
    node.beginType = BeginType.Continue
    // node.pauseEndfulltime = node.pauseEndfulltime || []
    // node.pauseEndfulltime.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))

    node.pauseStartfulltime = node.pauseStartfulltime || []
    node.pauseStartfulltime.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))

    calStint(node)

    if (data.type == 'undo') {
      mainData.setUndo(node)

    }
    else {
      mainData.setComplete(node)
    }
  }
  else if (data.text == '删除') {
    if (data.type == 'undo') {
      mainData.delUndo(node.id)
    }
    else {
      mainData.delComplete(node.id)
    }
  }
}

const undoIconClick = (data) => {
  if (data.beginType === BeginType.Begin) {
    data.beginType = BeginType.End
    data.starttime = dayjs().format('MM-DD HH:mm')
    data.startfulltime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    if (settings.singleMode) {
      // mainData.undoList.filter(x => x.id != data.id && x.beginType == BeginType.End).map(x => {
      //   x.beginType = BeginType.Continue
      //   x.pauseStartfulltime = x.pauseStartfulltime || []
      //   x.pauseStartfulltime.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))
      //   x = calStint(x)
      // })

      mainData.undoList.filter(x => (!x.children || x.children.length == 0) && x.id != data.id && x.beginType == BeginType.End).map(x => {
        x.beginType = BeginType.Continue
        x.pauseStartfulltime = x.pauseStartfulltime || []
        x.pauseStartfulltime.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))
        x = calStint(x)
      })

      mainData.undoList.filter(x => x.children && x.children.length > 0).map(item => {
        item.children.filter(x => x.id != data.id && x.beginType == BeginType.End).map(y => {
          y.beginType = BeginType.Continue
          y.pauseStartfulltime = y.pauseStartfulltime || []
          y.pauseStartfulltime.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))
          y = calStint(y)
        })
      })
    }

    mainData.setUndo(data)

  }
  else if (data.beginType === BeginType.End) {
    data.endtime = dayjs().format('MM-DD HH:mm')
    data.endfulltime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    calStint(data)
    mainData.doComplete(data)
  }
  else if (data.beginType === BeginType.Continue) {
    data.beginType = BeginType.End

    data.starttime = data.starttime || dayjs().format('MM-DD HH:mm')
    data.startfulltime = data.startfulltime || dayjs().format('YYYY-MM-DD HH:mm:ss')
    data.pauseEndfulltime = data.pauseEndfulltime || []
    data.pauseEndfulltime.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))

    calStint(data)

    if (settings.singleMode) {
      mainData.undoList.filter(x => (!x.children || x.children.length == 0) && x.id != data.id && x.beginType == BeginType.End).map(x => {
        x.beginType = BeginType.Continue
        x.pauseStartfulltime = x.pauseStartfulltime || []
        x.pauseStartfulltime.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))
        x = calStint(x)
      })

      mainData.undoList.filter(x => x.children && x.children.length > 0).map(item => {
        item.children.filter(x => x.id != data.id && x.beginType == BeginType.End).map(y => {
          y.beginType = BeginType.Continue
          y.pauseStartfulltime = y.pauseStartfulltime || []
          y.pauseStartfulltime.push(dayjs().format('YYYY-MM-DD HH:mm:ss'))
          y = calStint(y)
        })
      })
    }

    mainData.setUndo(data)
  }
}

const completeIconClick = (data) => {
  // if (data.beginType === BeginType.End) {
  data.endtime = null
  data.endfulltime = null

  mainData.doUndo(data)
  // }
}

const calStint = (data) => {
  let stint = 0
  let pauseStint = 0
  let pauseCount = (data.pauseStartfulltime && data.pauseStartfulltime.length) //暂停次数
  if (pauseCount > 0) {
    stint += getTimeDif(data.startfulltime, data.pauseStartfulltime[0], "s")
    pauseStint += getTimeDif(data.pauseStartfulltime[0], (data.pauseEndfulltime && data.pauseEndfulltime[0]), "s")
    if (pauseCount > 1) {
      for (let i = 1; i < pauseCount; i++) {
        stint += getTimeDif(data.pauseEndfulltime[i - 1], data.pauseStartfulltime[i], "s")
        pauseStint += getTimeDif(data.pauseStartfulltime[i], (data.pauseEndfulltime && data.pauseEndfulltime[i]), "s")
      }
    }
    if (data.pauseEndfulltime && data.pauseEndfulltime[pauseCount - 1]) {
      stint += getTimeDif(data.pauseEndfulltime[pauseCount - 1], data.endfulltime, "s")
    }

  }
  else {
    stint += getTimeDif(data.startfulltime, data.endfulltime, "s")
  }

  data.stintm = common.worktimeConvert(stint, "m")
  data.stint = common.worktimeConvert(stint)
  data.pauseStint = common.worktimeConvert(pauseStint)
  data.pauseStintm = common.worktimeConvert(pauseStint, "m")
  return data
}

const getTimeDif = (start, end, type = "") => {
  if (!start && !end) {
    return -1
  }
  if (!start || !end) {
    return 0
  }
  let workTimeEnable = settings.workTimeEnable
  let workTime = settings.workTime
  if (!workTime.some(item => !item)) {
    return common.worktimeStint(start, end, workTime, type)
  } else {
    return common.timeDif(start, end, type)
  }
}

const stintClick = (data, type) => {
  dialogStintShow.value = true
  data.type = type
  dialogStintNode.value = data

}

const dialogStintConfirm = (data) => {
  calStint(data)
  if (data.type == 'undo') {
    mainData.setUndo(data)
  }
  else {
    mainData.setComplete(data)
  }
  console.log(data)
}



const dataToAoa = () => {
  let title = ['待办分类', '待办组', '待办', '状态', '开始时间', '结束时间', '工时（分钟）', '暂停次数', '暂停时长（分钟）']
  let aoa = [title]
  mainData.getNodeList('undoList').forEach(item => {
    let arr = []
    let todotype = "", content = item.content, parentContent = item.parentContent
    if (parentContent) {
      let index = parentContent.indexOf('】')
      index = index == -1 ? parentContent.indexOf(']') : index
      todotype = parentContent.substring(0, index + 1).replace('【', '').replace('】', '').replace('[', '').replace(']', '')
      arr.push(todotype, parentContent.substring(index + 1, parentContent.length), content, '未完成', item.startfulltime || '', item.endfulltime || '', item.stintm == 0 ? 0 : (item.stintm || ''), (item.pauseStartfulltime && item.pauseStartfulltime.length) || 0, item.pauseStintm || 0)
    }
    else {
      let index = content.indexOf('】')
      index = index == -1 ? content.indexOf(']') : index
      todotype = content.substring(0, index + 1).replace('【', '').replace('】', '').replace('[', '').replace(']', '')
      arr.push(todotype, parentContent, content.substring(index + 1, content.length), '未完成', item.startfulltime || '', item.endfulltime || '', item.stintm == 0 ? 0 : (item.stintm || ''), (item.pauseStartfulltime && item.pauseStartfulltime.length) || 0, item.pauseStintm || 0)
    }


    aoa.push(arr)
  })
  mainData.getNodeList('completeList').forEach(item => {
    let arr = []
    let todotype = "", content = item.content, parentContent = item.parentContent
    if (parentContent) {
      let index = parentContent.indexOf('】')
      index = index == -1 ? parentContent.indexOf(']') : index
      todotype = parentContent.substring(0, index + 1).replace('【', '').replace('】', '').replace('[', '').replace(']', '')
      arr.push(todotype, parentContent.substring(index + 1, parentContent.length), content, '已完成', item.startfulltime || '', item.endfulltime || '', item.stintm == 0 ? 0 : (item.stintm || ''), (item.pauseStartfulltime && item.pauseStartfulltime.length) || 0, item.pauseStintm || 0)
    }
    else {
      let index = content.indexOf('】')
      index = index == -1 ? content.indexOf(']') : index
      todotype = content.substring(0, index + 1).replace('【', '').replace('】', '').replace('[', '').replace(']', '')
      arr.push(todotype, parentContent, content.substring(index + 1, content.length), '已完成', item.startfulltime || '', item.endfulltime || '', item.stintm == 0 ? 0 : (item.stintm || ''), (item.pauseStartfulltime && item.pauseStartfulltime.length) || 0, item.pauseStintm || 0)
    }

    aoa.push(arr)
  })
  return aoa
}
const exportExcel = () => {
  let aoa = dataToAoa()
  sheetExport(aoa, '计时导出.xlsx')
}


const clearCompleted = () => {
  confirm('确认要清除已完成待办吗？', () => {
    mainData.clearCompleteList()
  }, (err) => {
  })
}

const archiveCompleted = () => {
  confirm('确认要归档已完成待办吗？', () => {
    mainData.archiveCompleted()
  }, (err) => {
    console.log(err)
  })
}


</script>

<style lang="scss">
.main {
  margin-bottom: 100px;
  width: 100%;
  // height: calc(100vh - 2em);
  // position: relative;

  .main-title {
    display: flex;
    justify-content: space-between;

    .main-title-text {
      font-size: 18px;
      margin-bottom: 5px;
    }

    .main-title-total {
      display: flex;
      align-items: end;
    }

    .main-title-right {
      display: flex;

      .main-title-right-icon {
        margin: 0px 5px;
        align-self: end;

        .t1 {
          top: 1px;
        }

        .el-icon {
          font-size: 19px;
          color: #409EFF;
          vertical-align: bottom;

        }

        .svg-icon {
          height: 20px;
          width: 20px;
          color: #409EFF;
          vertical-align: bottom;
        }
      }


    }
  }

  .flex {
    display: flex;
  }

  .el-collapse-item {
    box-shadow: 0 0 5px 0;
  }

  .el-collapse-item__header {
    padding: 0px 10px;
    // font-size: 13px;
    cursor: default;
  }

  .el-collapse-item__content {
    padding-bottom: 0px;

  }

  .el-input__wrapper {
    box-shadow: none;
  }

  .el-tree-node__content {
    min-height: var(--el-collapse-header-height);
    line-height: var(--el-collapse-header-height);
    cursor: default;
  }

  .el-tree-node__content {
    border-top: 1px solid var(--el-border-color);
    height: auto;
  }

  .el-icon,
  .svg-icon {
    cursor: pointer;
  }

  .list-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding: 5px 10px 5px 5px;
    position: inherit;

    .el-input__wrapper {
      padding-right: 40px;
    }

    .list-content-span {
      white-space: break-spaces;
      word-break: break-all;
      line-height: 20px;
      padding-right: 20px;
    }

    .list-content-span-sub {
      white-space: break-spaces;
      word-break: break-all;
      line-height: 20px;
      padding-right: 20px;
    }

    .list-content-add-div {
      width: 40px;
      display: flex;
      align-items: center;
    }

    .list-content-add {
      position: absolute;
      right: 10px;
    }

    .list-content-time {
      display: flex;
      margin-right: 40px;
    }

    .list-content-time-sub {
      display: flex;
      margin-right: 10px;
    }

    .list-content-time-stint {
      margin-right: 10px;
      background-color: #f56c6c;
      color: #fff;
      padding: 2px 10px;
      border-radius: 10px;
      height: 26px;
      line-height: 26px;
      align-self: center;
      cursor: pointer;
    }

    .list-content-time-stint:hover {
      background-color: #ff4141;
    }

    .list-content-time-span {
      line-height: 20px;
    }
  }
}
</style>