import { ElMessageBox, ElMessage } from 'element-plus'

export function alert(message) {
    ElMessageBox.alert(message, '提示', {
        confirmButtonText: '确定',
        callback: action => {
            // console.log('alert回调函数:', action);
        }
    });
}

export function error(message) {
    ElMessage.error(message);
}

export function confirm(message, success, fail) {
    ElMessageBox.confirm(
        message,
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        if (typeof success == 'function') {
            success()
        }
    }).catch((err) => {
        if (typeof fail == 'function') {
            fail(err)
        }
    })
}