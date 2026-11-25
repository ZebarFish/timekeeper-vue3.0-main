<template>
    <div class="cropper-container">
        <div class="list-img-box">
            <div class="upload-image" :style="{ backgroundImage: `url(${imageUrl})` }"></div>

            <div class="upload-image-cropper">
                <div>
                    <el-button type="primary" @click="uploadPicture('flagImg')">
                        <el-icon class="el-icon--left">
                            <UploadFilled />
                        </el-icon>
                        上传图片</el-button>
                </div>
                <span>支持jpg、svg、png等图片格式</span>
            </div>

        </div>
        <!-- 剪裁组件弹窗 -->
        <el-dialog title="图片裁切" v-model="cropperModel" width="700px" center>
            <cropper-image :key="cropperKey" :initImg="true" :Name="cropperName" @uploadImgSuccess="handleUploadSuccess"
                ref="cropper">
            </cropper-image>
        </el-dialog>
        <!--查看大图片-->
        <!-- <el-dialog title="查看图片" v-model="imgVisible" center>
            <img :src="imgName" v-if="imgVisible" style="width: 100%" alt="查看">
        </el-dialog> -->
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import CropperImage from "./CropperImage";

const imageUrl = computed({
    get() {
        return props.imageUrl
    },
    set(val) {
        emit('update:imageUrl', val)
    }
})

const cropperModel = ref(false);
const cropperName = ref('');
const cropperKey = ref(1)
const imgName = ref('');
const imgVisible = ref(false);

const props = defineProps({
    imageUrl: {
        type: String,
        default: ''
    }
})
const emit = defineEmits(['update:imageUrl', 'UploadSuccess'])

const handleUploadSuccess = (data) => {
    imageUrl.value = data.url
    emit('UploadSuccess', data.file)
    cropperModel.value = false;
}
const uploadPicture = (name) => {
    cropperName.value = name;
    cropperModel.value = true;
    cropperKey.value = cropperKey.value + 1
}

</script>
<style lang="scss" scoped>
.upload-list-cover {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 40px;
    align-items: center;
    background: rgba(0, 0, 0, .6);
    opacity: 0;
    transition: opacity 1s;
}

.cover_icon {
    font-size: 30px;
}

.upload-btn {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    border: 1px solid #cccccc;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 0 1px #cccccc;
}

.upload-btn:hover {
    border: 1px solid #69b7ed;
}

.upload-btn i {
    margin: 5px;
}

.cropper-container {
    .list-img-box {
        display: flex;
    }

    .upload-image {
        width: 200px;
        height: 100px;
        border-radius: 10px;
        background-size: 100% 100%;

    }

    .upload-image-cropper {
        margin-left: 20px;
        align-self: baseline;
        display: flex;
        flex-direction: column;

        span {
            font-size: 13px;
        }
    }
}
</style>