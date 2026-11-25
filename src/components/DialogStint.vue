<template>
    <el-dialog v-model="dialogVisible" title="工时详情" width="500">
        <div class="stint-dialog-title">
            <span>工时{{ gdetailStint }}，暂停{{ gpauseCount }}次，暂停时长{{ gpauseStint }}</span>

        </div>
        <el-table :data="gstintDetailList" :border="true" :max-height="235" style="width: 100%">
            <el-table-column prop="start" label="开始时间">
                <template #default="scope">
                    <el-input v-model="scope.row.start" @change="handleChange(scope.row)"
                        placeholder="请输入内容"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="end" label="结束时间">
                <template #default="scope">
                    <span v-show="scope.row.end != 'none'">
                        <el-input v-model="scope.row.end" @change="handleChange(scope.row)"
                            placeholder="请输入内容"></el-input>
                    </span>

                </template>
            </el-table-column>
        </el-table>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="beforeClose">取消</el-button>
                <el-button type="primary" @click="confirm">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { onMounted, onUpdated, reactive, ref, watch } from 'vue'
import useMainStore from '@/stores/modules/main'
import { error } from '@/utils/alert'
import { deepCopy } from '@/common/common'
import dayjs from 'dayjs'

const gpauseCount = ref(0)
const gpauseStint = ref(0)
const gdetailStint = ref(0)
const gstintDetailList = ref([])

const mainData = useMainStore()
const props = defineProps({
    dialogShow: { type: Boolean, default: false },
    node: { type: Object, default: {} },
})
const emit = defineEmits(['confirm', 'update:dialogShow'])

const dialogVisible = computed({
    get: () => props.dialogShow,
    set: (val) => {
        emit('update:dialogShow', val)
    }
})

// let dialogVisible = ref(props.dialogShow)

watch(() => props.dialogShow, (val) => {
    if (val) {
        gstintDetailList.value = []
        stintDetail()

    }
})

let check = false
const handleChange = (data) => {
    //校验是时间格式

    if (data.start && !isTime(data.start)) {
        error('时间格式错误')
        check = false
        return
    }
    if (data.end && data.end != 'none' && !isTime(data.end)) {
        error('时间格式错误')
        check = false
        return


    }

    if (data.start && data.end && data.end != 'none' && dayjs(data.start) > dayjs(data.end)) {
        error('开始时间不能大于结束时间')
        check = false
        return

    }
    check = true

}

const isTime = (time) => {
    //判断字符串是否为完整的日期时间格式
    let reg = /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
    if (reg.test(time)) {
        return true;
    }
    return false;
}

const stintDetail = () => {
    let data = props.node
    let iscomplete = data.type == "complete"

    let tmp = {
        start: '',
        end: ''
    }
    let pauseCount = (data.pauseStartfulltime && data.pauseStartfulltime.length) || 0
    gpauseCount.value = pauseCount
    gpauseStint.value = data.pauseStint || 0
    gdetailStint.value = data.stint || 0
    if (pauseCount > 0) {
        tmp.start = data.startfulltime//.substring(0,16)
        tmp.end = data.pauseStartfulltime[0]//.substring(0,16)
        addGstintDetailList(tmp)
        if (pauseCount > 1) {
            for (let i = 1; i < pauseCount; i++) {
                let tmp = {
                    start: '',
                    end: ''
                }
                tmp.start = data.pauseEndfulltime[i - 1]//.substring(0,16)
                tmp.end = data.pauseStartfulltime[i]//.substring(0,16)

                addGstintDetailList(tmp)
            }
        }
        let tmp2 = {
            start: '',
            end: ''
        }
        if (data.pauseEndfulltime && data.pauseEndfulltime[pauseCount - 1]) {
            tmp2.start = data.pauseEndfulltime[pauseCount - 1]//.substring(0,16)
            tmp2.end = iscomplete ? data.endfulltime : 'none'//.substring(0,16)
            addGstintDetailList(tmp2)

        }

    }
    else {
        tmp.start = data.startfulltime//.substring(0,16)
        tmp.end = data.endfulltime//.substring(0,16)
        addGstintDetailList(tmp)
    }

}

const addGstintDetailList = (data) => {
    data.oldStart = data.start
    data.oldEnd = data.end
    gstintDetailList.value.push(data)
}

//根据gstintDetailList来反向更新data
const GetChangeData = () => {
    let stintData = deepCopy(props.node)
    let iscomplete = stintData.type == "complete"

    const total = gstintDetailList.value.length - 1
    gstintDetailList.value.forEach((item, index) => {
        if (index == 0) {
            stintData.startfulltime = item.start
            stintData.starttime = dayjs(item.start).format('MM-DD HH:mm')
        }
        if (iscomplete && index == total && item.end != 'none') {
            stintData.endfulltime = item.end
            stintData.endtime = dayjs(item.end).format('MM-DD HH:mm')
        }
        updatePauseTimes(stintData, item)
    })
    return stintData
}

const updatePauseTimes = (stintData, item) => {
    let startIndex = stintData.pauseEndfulltime && stintData.pauseEndfulltime.findIndex(x => x === item.oldStart);
    if (startIndex > -1) {
        stintData.pauseEndfulltime[startIndex] = item.start;
    }

    let endIndex = stintData.pauseStartfulltime && stintData.pauseStartfulltime.findIndex(x => x === item.oldEnd);
    if (endIndex > -1) {
        stintData.pauseStartfulltime[endIndex] = item.end;
    }
}

const confirm = () => {
    // if (!check) {
    //     return false
    // }
    //增加判断，gstintDetailList的开始时间不大于结束时间，结束时间不大于下一行的开始时间
    let tableData = gstintDetailList.value
    let iscomplete = true
    for (let i = 0; i < tableData.length; i++) {

        if (tableData[i].start && !isTime(tableData[i].start)) {
            error(`第${i + 1}行开始时间格式错误`)
            iscomplete = false
            break
        }

        if (tableData[i].end && tableData[i].end != 'none' && !isTime(tableData[i].end)) {
            error(`第${i + 1}行结束时间格式错误`)
            iscomplete = false
            break
        }

        if (dayjs(tableData[i].start) > dayjs(tableData[i].end)) {
            error(`第${i + 1}行开始时间不能大于结束时间`)
            iscomplete = false
            break
        }
        if (i < tableData.length - 1) {
            if (dayjs(tableData[i].end) > dayjs(tableData[i + 1].start)) {
                error(`第${i + 1}行结束时间不能大于下一行的开始时间`)
                iscomplete = false
                break
            }
        }
    }
    if (iscomplete) {
        let tmp = GetChangeData()
        emit('confirm', tmp)
        dialogVisible.value = false
    }
}

const beforeClose = () => {
    emit('update:dialogShow', false)
}

</script>

<style scoped>
.stint-dialog-title {
    line-height: 20px;
    font-size: 16px;
    margin-bottom: 10px
}
</style>