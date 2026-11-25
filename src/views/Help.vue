<template>
    <div>
        <el-card style="margin-bottom: 20px;">
            <template #header>
                <div class="card-header">
                    <span>新增待办</span>
                </div>
            </template>
            <p>1.在设置中添加待办分类</p>
            <p>2.输入待办，回车新增</p>
            <p>3.输入双横线--，回车新增多级待办</p>
            <p>4.待办层级最大为2层</p>
        </el-card>
        <el-card style="margin-bottom: 20px;">
            <template #header>
                <div class="card-header">
                    <span>右键菜单</span>
                </div>
            </template>
            <p>首页的待办列表和我的待办，可以右键编辑、删除</p>
        </el-card>
        <el-card style="margin-bottom: 20px;">
            <template #header>
                <div class="card-header">
                    <span>待办工时明细编辑</span>
                </div>
            </template>
            <p>点击工时，对话框内的时间可以编辑，点击确认保存</p>
        </el-card>
        <el-card style="margin-bottom: 20px;">
            <template #header>
                <div class="card-header">
                    <span>我的待办复制粘贴</span>
                </div>
            </template>
            <p>编辑状态下，按住Shift键使用鼠标选中文字Ctrl+C、Ctrl+V复制粘贴</p>
        </el-card>
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>感谢支持</span>
                </div>
            </template>
            <p>
                插件好用的话给个5星好评支持我一下吧！遇到无法解决的问题请评论区留言。
            </p>
        </el-card>
    </div>
</template>
<style scoped>
.card-header {
    font-weight: bold;
    font-size: 14px;
}

p {
    font-size: 13px;
}
</style>