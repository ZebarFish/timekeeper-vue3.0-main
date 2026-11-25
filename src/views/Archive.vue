<template>
    <div class="archive-container">
        <!-- <div class="home-header">
            <div class="home-header-left"><span style="font-size: 18px;font-weight: bold;">归档列表</span> </div>

        </div>
        <el-divider style="margin:5px 0px 15px 0px;" /> -->

        <el-form class="search-form" :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true"
            label-width="68px">
            <el-form-item label="待办列表" prop="title">
                <el-input v-model="queryParams.title" placeholder="请输入待办列表" clearable style="width: 240px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="待办内容" prop="content">
                <el-input v-model="queryParams.content" placeholder="请输入待办内容" clearable style="width: 240px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="归档时间" style="width: 308px">
                <el-date-picker v-model="queryParams.dateRange" value-format="YYYY-MM-DD" type="daterange"
                    range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
            </el-form-item>
        </el-form>

        <div class="search-button">
            <div class="search-botton-left">
                <el-button type="danger" size="small" plain icon="Delete" @click="handleDelete">删除</el-button>
                <el-button type="warning" size="small" plain icon="Download" @click="handleExport">导出</el-button>

            </div>
            <div class="search-botton-right">
                <right-toolbar v-model:showSearch="showSearch" :fresh="false"
                    @queryTable="filterTableData"></right-toolbar>
            </div>
        </div>

        <el-table header-row-class-name="table-header" :data="filterTableData" style="width: 100%"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="40" align="center" />
            <el-table-column label="待办列表" width="70" prop="title" />
            <el-table-column label="待办内容" prop="content">
                <template #default="scope">
                    <span>{{ scope.row.parentContent ? scope.row.parentContent + '--' + scope.row.content :
            scope.row.content }}</span>
                </template>
            </el-table-column>
            <el-table-column label="开始时间" width="90" prop="startfulltime" />
            <el-table-column label="结束时间" width="90" prop="endfulltime" />
            <el-table-column label="工时" width="50" prop="stint" />
            <el-table-column label="暂停次数" width="70" prop="pauseCount" />
            <el-table-column label="暂停时长" width="70" prop="pauseStint" />
            <el-table-column label="归档时间" width="90" prop="createTime" />

        </el-table>
        <pagination v-show="total > 0" :total="Number(total)" v-model:page="queryParams.currentPage"
            v-model:limit="queryParams.pageSize" @pagination="filterTableData" />
        <!-- <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20]"
            size="small" layout="total,sizes, prev, pager, next" :total="total" /> -->
    </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, reactive, ref } from 'vue'
import useArchiveStore from '@/stores/modules/archive'
import { sheetExport } from '@/utils/excel.js'
import { confirm, alert } from '@/utils/alert'

const archiveStore = useArchiveStore()

const queryParams = reactive({
    currentPage: 1,
    pageSize: 5,
    content: undefined,
    dateRange: undefined,
    title: undefined,
})
const showSearch = ref(false)
const ids = ref([])
const filterTableData = computed(() => {
    const filteredData = filterData()
    const startIndex = (queryParams.currentPage - 1) * queryParams.pageSize;
    const endIndex = startIndex + queryParams.pageSize;
    return filteredData.slice(startIndex, endIndex);
})

const total = computed(() => {
    // 考虑到性能，我们可以直接计算过滤后的数据长度，而不是从filterTableData.value中获取
    const filteredData = filterData()
    return filteredData.length
})

onMounted(() => {
    archiveStore.init()
})

const filterData = () => {
    const filteredData = archiveStore.archiveList.filter(
        (data) => {
            let ret = true
            if (queryParams.title &&
                !(data.title || '').toLowerCase().includes(queryParams.title.toLowerCase())) {
                ret = ret && false
            }

            if (queryParams.content &&
                !(data.content || '').toLowerCase().includes(queryParams.content.toLowerCase()) &&
                !data.parentContent?.toLowerCase().includes(queryParams.content.toLowerCase())) {
                ret = ret && false

            }

            if (queryParams.dateRange &&
                !(data.createTime > queryParams.dateRange[0] && data.createTime < queryParams.dateRange[1])) {
                ret = ret && false

            }

            return ret
        }
    )
    return filteredData
}

function handleSelectionChange(selection) {
    ids.value = selection.map((item) => item.id);
}

const handleDelete = () => {
    confirm('确认要删除选中待办吗？', () => {
        const delIds = ids.value;
        archiveStore.delArchiveList(delIds)
    }, (err) => {
    })
}
const handleExport = () => {
    let aoa = dataToAoa()
    sheetExport(aoa, '归档导出.xlsx')

}

const dataToAoa = () => {
    let title = ['待办列表', '待办分类', '待办组', '待办', '开始时间', '结束时间', '工时（分）', '暂停次数', '暂停时长（分）', '归档时间']
    let aoa = [title]
    archiveStore.archiveList.forEach(item => {
        let arr = []
        let todotype = "", content = item.content, parentContent = item.parentContent
        if (parentContent) {
            let index = parentContent.indexOf('】')
            index = index == -1 ? parentContent.indexOf(']') : index
            todotype = parentContent.substring(0, index + 1).replace('【', '').replace('】', '').replace('[', '').replace(']', '')
            arr.push(item.title, todotype, parentContent.substring(index + 1, parentContent.length), content, item.startfulltime || '', item.endfulltime || '', item.stintm == 0 ? 0 : (item.stintm || ''), (item.pauseStartfulltime && item.pauseStartfulltime.length) || 0, item.pauseStintm || 0, item.createTime)
        }
        else {
            let index = content.indexOf('】')
            index = index == -1 ? content.indexOf(']') : index
            todotype = content.substring(0, index + 1).replace('【', '').replace('】', '').replace('[', '').replace(']', '')
            arr.push(item.title, todotype, parentContent, content.substring(index + 1, content.length), item.startfulltime || '', item.endfulltime || '', item.stintm == 0 ? 0 : (item.stintm || ''), (item.pauseStartfulltime && item.pauseStartfulltime.length) || 0, item.pauseStintm || 0, item.createTime)
        }
        aoa.push(arr)
    })

    return aoa
}

const handleQuery = () => { }
const resetQuery = () => { }

</script>
<style lang="scss">
.archive-container {
    .search-form {
        background-color: var(--background-color);
        border-radius: 5px;
        padding: 10px 0px 0px 10px;
    }

    .search-button {
        background-color: var(--background-color);
        // border-radius: 5px;
        padding: 10px 10px;
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        align-items: center;
    }

    .el-table--default {
        font-size: 13px;
    }

    .el-table--default .cell {
        padding: 0px 5px;
    }

    .el-table .cell {
        padding: 0px 5px;
    }
}
</style>