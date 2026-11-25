<template>
    <div>
        <div v-if="!isAdd" :key="data.id" :id="data.mid" class="card-container card-editable">
            <div @click="$router.push(`/${data.mid}`)" class="card-head"
                :style="{ backgroundImage: `url(${data.imageUrl})` }">
            </div>
            <!-- <div class="card-head" v-else style="background-color: #663d74">
        </div> -->
            <span @click="$router.push(`/${data.mid}`)" class="card-body">{{ data.title }}</span>
            <div class="card-close" @click="remove">
                <el-icon>
                    <CircleClose />
                </el-icon>
            </div>
        </div>
        <div v-else class="card-container" @click="click">
            <div class="card-head card-add">
                <el-icon :size="40" color="#ffffff">
                    <Plus />
                </el-icon>
            </div>
            <span class="card-body">{{ data.title }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
// import { useRouter } from 'vue-router';

// const router = useRouter()

const props = defineProps({
    data: {
        type: Object,
        default: () => { }
    },
    isAdd: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['click', 'remove'])

const remove = () => {
    emit('remove')

}


const click = () => {
    emit('click')
}

</script>

<style lang="scss">
.card-container:hover {
    /*top: -3px;*/
}

.card-container {
    width: 150px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 10px;
    position: relative;

    .card-head {
        height: 75px;
        background-size: 100% 100%;
        border-radius: 5px 5px 0px 0px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    .card-add {
        background-color: #a76283;
        display: flex;
        justify-content: center;

        .el-icon {
            align-self: center;
        }
    }

    .card-body {
        line-height: 30px;
        font-size: 13px;
        font-weight: bold;
        padding: 6px 15px;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        background-color: var(--background-color-home);
        border-radius: 0px 0px 5px 5px;
        cursor: pointer;

    }

    .card-close {
        position: absolute;
        right: -5px;
        top: -5px;
        font-size: 20px;
        color: #fff;
        cursor: pointer;

        .el-icon {
            background-color: #474747;
            border-radius: 50%;
        }
    }
}
</style>