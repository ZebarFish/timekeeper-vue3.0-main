import api from "@/api/api"
import dayjs from "dayjs"

// 比较版本号
function compareVersion(v1, v2) {
    const arr1 = v1.split('.');
    const arr2 = v2.split('.');
    const len = Math.max(arr1.length, arr2.length);

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(arr1[i] || 0);
        const num2 = parseInt(arr2[i] || 0);

        if (num1 < num2) {
            return -1;
        } else if (num1 > num2) {
            return 1;
        }
    }

    return 0;
}

export function transfer() {
    // 获取版本
    // const version = utools.getAppVersion()
    // console.log('当前版本号：', version);
    const version = '1.0.1.0'
    const dataVersion = api.getDataVersion()

    console.log('当前数据版本号：', dataVersion);


    // 判断版本号是否小于
    if (compareVersion(dataVersion, version) < 0) {
        // 把老数据转换后存入新的对象中

        //配置迁移
        //1.任务模式迁移，一致
        //2.待办分类迁移，一致
        //3.工作时间迁移，老数据是时分秒字符串，添加年月日
        let workTime = api.getSetting().workTime
        workTime = workTime.map(item => {
            if (!item.includes('2024-07-01'))
                item = '2024-07-01 ' + item
            return item
        })
        api.saveWorkTime(workTime)

        //待办迁移
        //1.未完成待办迁移
        let undoList = api.getUndoListOld()
        console.log('undoList1', undoList)
        if (undoList.data && undoList.data.length > 0) {
            undoList.data = undoList.data.map(item => {
                item.createtime = dayjs().format('YYYY-MM-DD HH:mm:ss')
                item.editable = false
                item.level = 1
                item.children = []
                item.beginType = item.isbegin || 1
                return item
            })
            console.log('undoList2', undoList)
            api.saveUndoList('1', undoList.data)
            api.removeUndoListOld()
        }
        //2.已完成待办迁移
        let completeList = api.getCompleteListOld()
        console.log('completeList1', completeList)
        if (completeList.data && completeList.data.length > 0) {
            completeList.data = completeList.data.map(item => {
                item.createtime = dayjs().format('YYYY-MM-DD HH:mm:ss')
                item.editable = false
                item.level = 1
                item.children = []
                item.beginType = 3
                return item
            })
            console.log('completeList2', completeList)
            api.saveCompleteList('1', completeList.data)
            api.removeCompleteListOld()
        }

        //更新版本
        api.setDataVersion(version)

    } else {
        console.log(`系统版本号${version}小于数据版本号${dataVersion}`)
    }
}