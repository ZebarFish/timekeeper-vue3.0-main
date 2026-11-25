<template>
    <el-form ref="formRef" :model="form" label-width="90px">
        <div class="setting-div">
            <el-form-item label="单任务模式" prop="singleMode">
                <div>
                    <el-switch v-model="form.singleMode"></el-switch>
                </div>
            </el-form-item>

            <div class="setting-remark">
                <label for="">开启单任务模式，未完成列表中只会同时存在一个进行中的待办</label>
            </div>

        </div>
        <div class="setting-div">

            <label class="el-form-item__label" style="width:90px;">
                工作时间<el-icon title="重置" :size="20" color="#409EFF" style="align-self: center;cursor: pointer;"
                    @click="refreshWorkTime">
                    <Refresh />
                </el-icon>
            </label>
            <div>
                <!-- 上午开始结束时间 -->
                <div class="setting-time" style="display: flex;">
                    <el-form-item label="上午：" prop="workTime[0]">
                        <el-time-picker v-model="form.workTime[0]" placeholder="选择开始时间" type="time"></el-time-picker>
                    </el-form-item>
                    <el-form-item label="~" label-width="auto" prop="workTime[1]">
                        <el-time-picker v-model="form.workTime[1]" placeholder="选择结束时间" type="time"></el-time-picker>
                    </el-form-item>

                </div>
                <div class="setting-time" style="display: flex;">
                    <!-- 下午开始结束时间 -->
                    <el-form-item label="下午：" prop="workTime[2]">
                        <el-time-picker v-model="form.workTime[2]" placeholder="选择开始时间" type="time"
                            align="right"></el-time-picker>
                    </el-form-item>
                    <el-form-item label="~" label-width="auto" prop="workTime[3]">
                        <el-time-picker v-model="form.workTime[3]" placeholder="选择结束时间" type="time"
                            align="right"></el-time-picker>
                    </el-form-item>
                </div>
            </div>
            <div class="setting-remark">
                <label>设置工作时间后，工时统计只会统计工作时间内的（如出现无法设置时间情况，可以尝试点击重置按钮）</label>
            </div>

        </div>
        <div class="setting-div">
            <el-form-item label="待办分类" prop="todoType">
                <el-col :span="22">
                    <el-input type="textarea" placeholder="待办分类，多个分类用“;”隔开" v-model="form.todoType"
                        :rows="5"></el-input>
                </el-col>
            </el-form-item>

        </div>
    </el-form>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import { debounce } from '@/common/common';
import useSettingsStore from '@/stores/settings'

const form = useSettingsStore();

// 监听formData的变化并执行自动保存
watch(
    () => (form),
    () => debounceSave(),
    { deep: true }
);

const autoSave = () => {
    form.todoType = form.todoType.replace(/ /g, '')
    form.setSetting()
}

// 防抖函数
const debounceSave = debounce(autoSave, 500)

function refreshWorkTime() {
    form.workTime = ['2024-07-01 09:00:00', '2024-07-01 12:00:00', '2024-07-01 14:00:00', '2024-07-01 18:00:00']
}

</script>

<style lang="scss">
.setting-div {
    border-radius: 15px;
    padding: 20px 20px 10px 20px;
    background-color: var(--background-color-home);
    // box-shadow: 0 0 4px;
    margin-bottom: 20px;

    .el-form-item__content {
        display: block;
    }

    .setting-remark {
        font-size: 13px;
        color: var(--el-color-font-1);
        margin-left: 90px;
    }
}

.setting-time {
    .el-form-item__label {
        padding: 0px;
    }

}
</style>