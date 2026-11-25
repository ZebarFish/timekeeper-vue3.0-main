import { isUTools } from '@/common/common'
import { Msg } from '@/common/commonType'
import { toRaw } from 'vue'

export class Storage {
  /**
   * 异步获取
   * 注意：浏览器中使用 localforage，与同步方法使用的数据库不同
   * @param {string} key
   * @return {Promise<Msg>}
   */
  get(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 异步设置值
   * 注意：浏览器中使用 localforage，与同步方法使用的数据库不同
   * @param {string} key
   * @param {Object} value
   * @return {Promise<Msg>}
   */
  set(key, value) {
    throw new Error('Abstract method!')
  }

  /**
   * 异步删除
   * 注意：浏览器中使用 localforage，与同步方法使用的数据库不同
   * @param {string} key
   * @return {Promise<Msg>}
   */
  remove(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步获取
   * 注意：浏览器中使用 localStorage，与异步方法使用的数据库不同
   * @param {string} key
   * @return Object
   */
  getSync(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步设置值
   * 注意：浏览器中使用 localStorage，与异步方法使用的数据库不同
   * @param {string} key
   * @param {Object} value
   * @return {void}
   */
  setSync(key, value) {
    throw new Error('Abstract method!')
  }

  /**
   * 同步删除
   * 注意：浏览器中使用 localStorage，与异步方法使用的数据库不同
   * @param {string} key
   * @return {void}
   */
  removeSync(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 获取临时存储数据
   * @param {string} key
   * @return {Promise<Msg>}
   */
  getTempCache(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 设置临时存储数据
   * @param {string} key
   * @param {Object} attachment
   * @return {Promise<Msg>}
   */
  setTempCache(key, attachment) {
    throw new Error('Abstract method!')
  }

  /**
   * 删除临时存储数据
   * @param {string} key
   * @return {Promise<Msg>}
   */
  removeTempCache(key) {
    throw new Error('Abstract method!')
  }

  /**
   * 匹配键前缀获取所有，返回键值对。获取 set() 、setSync() 设置的值
   * @param {string} likeKey
   * @return {Promise<Msg>}
   */
  queryLikeAsObject(likeKey) {
    throw new Error('Abstract method!')
  }

  /**
   * 匹配键前缀获取所有，返回数组。获取 set() 、setSync() 设置的值
   * @param {string} likeKey
   * @return {Promise<Msg>}
   */
  queryLikeAsArray(likeKey) {
    throw new Error('Abstract method!')
  }

  /**
   * 匹配键前缀删除所有
   * @param {string} likeKey
   * @return {Promise<Msg>}
   */
  removeLike(likeKey) {
    throw new Error('Abstract method!')
  }
}



export class BrowserStorage extends Storage {
  get(key) {
    return new Promise((resolve, reject) => {
      try {
        let ret = localStorage.getItem(key)
        resolve(Msg.success(ret))
      }
      catch (e) {
        reject(Msg.error(e))
      }

    })
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, value)
        resolve(Msg.success())
      }
      catch (e) {
        reject(Msg.error(e))
      }
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(key)
        resolve(Msg.success())
      }
      catch (e) {
        reject(Msg.error(e))
      }
    })
  }

  getSync(key) {
    return JSON.parse(localStorage.getItem(key))
  }

  setSync(key, value) {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  removeSync(key) {
    localStorage.removeItem(key)
  }
  uploadFile() {
    return new Promise((resolve, reject) => {
      return resolve(Msg.success())
    })
  }
  getFile() {
    return new Promise((resolve, reject) => {
      return resolve(Msg.success())
    })
  }
  getFileSync() {
    return ''
  }
  removeFile() {

  }
  // queryLikeAsObject(likeKey) {
  //   return new Promise((resolve, reject) => {
  //     const data = {}
  //     localforage.iterate((v, k) => {
  //       if (k.startsWith(likeKey)) {
  //         data[k] = {items: v}
  //       }
  //     }).then(() => resolve(Msg.instance(data))).catch(err => reject(err))
  //   })
  // }

  // queryLikeAsArray(likeKey) {
  //   return new Promise((resolve, reject) => {
  //     const data = []
  //     localforage.iterate((v, k) => {
  //       if (k.startsWith(likeKey)) {
  //         v.forEach(item => data.push(item))
  //       }
  //     }).then(() => resolve(Msg.instance(data))).catch(err => reject(err))
  //   })
  // }

  // removeLike(likeKey) {
  //   return new Promise((resolve, reject) => {
  //     const ps = []
  //     localforage.iterate((v, k) => {
  //       if (k.startsWith(likeKey)) {
  //         ps.push(localforage.removeItem(k))
  //       }
  //     }).then(() =>
  //       Promise.all(ps)
  //         .then(() => resolve(Msg.instance()))
  //         .catch(err => reject(err))
  //     ).catch(err => reject(err))
  //   })
  // }
}


export class UToolsStorage extends Storage {
  get(key) {
    return new Promise((resolve, reject) => {
      resolve(Msg.instance(utools.dbStorage.getItem(key)))
    })
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      utools.dbStorage.setItem(key, value)
      resolve(Msg.instance())
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      utools.dbStorage.removeItem(key)
      resolve(Msg.instance())
    })
  }

  getSync(key) {
    return utools.dbStorage.getItem(key)
  }

  setSync(key, value) {
    if (value) {
      utools.dbStorage.setItem(key, toRaw(value))
    }
  }

  removeSync(key) {
    utools.dbStorage.removeItem(key)
  }

  getTempCache(key) {
    return new Promise((resolve, reject) => {
      localforage.getItem(key)
        .then(data => resolve(Msg.instance(data)))
        .catch(err => reject(err))
    })
  }

  setTempCache(key, attachment) {
    return new Promise((resolve, reject) => {
      localforage.setItem(key, attachment)
        .then(() => resolve(Msg.instance(Msg.instance())))
        .catch(err => reject(err))
    })
  }

  removeTempCache(key) {
    return new Promise((resolve, reject) => {
      localforage.removeItem(key)
        .then(() => resolve(Msg.instance(Msg.instance())))
        .catch(err => reject(err))
    })
  }

  queryLikeAsObject(likeKey) {
    return new Promise((resolve, reject) => {
      utools.db.promises.allDocs(likeKey).then(res => {
        let data = {}
        if (!res) {
          resolve(Msg.instance(data))
          return
        }
        res.forEach(item => data[item['_id']] = { items: item['value'] })
        resolve(Msg.instance(data))
      }).catch(err => reject(err))
    })
  }

  queryLikeAsArray(likeKey) {
    return new Promise((resolve, reject) => {
      utools.db.promises.allDocs(likeKey).then(res => {
        let data = []
        if (res) {
          res.forEach(item => item['value'].forEach(e => data.push(e)))
        }
        resolve(Msg.instance(data))
      }).catch(err => reject(err))
    })
  }

  removeLike(likeKey) {
    return new Promise((resolve, reject) => {
      utools.db.promises.allDocs(likeKey).then(res => {
        if (!res) {
          resolve(Msg.instance())
          return
        }
        res.forEach(item => utools.dbStorage.removeItem(item['_id']))
        resolve(Msg.instance())
      }).catch(err => reject(err))
    })
  }

  uploadFile(blob, key, type) {
    return new Promise((resolve, reject) => {
      // 使用Blob.arrayBuffer()读取Blob的内容为一个ArrayBuffer  
      blob.arrayBuffer().then(arrayBuffer => {
        // 创建一个Uint8Array视图  
        const uint8Array = new Uint8Array(arrayBuffer);
        const type = utools.db.getAttachmentType(key)
        if (type) {
          utools.db.remove(key)
        }
        let res = utools.db.postAttachment(key, uint8Array, type || 'image/jpeg')
        resolve(res)
      }).catch(err => reject(err))
    })
  }

  getFile(key) {
    return new Promise((resolve, reject) => {
      try {
        const buf = utools.db.getAttachment(key)
        const type = utools.db.getAttachmentType(key)
        if (buf && type) {
          // 创建Blob对象  
          const blob = new Blob([buf], { type: type })
          // 创建URL  
          const url = URL.createObjectURL(blob)
          resolve(url)
        }
        else {
          resolve('')

        }
      } catch (err) { reject(err) }
    })
  }

  getFileSync(key) {
    const buf = utools.db.getAttachment(key)
    const type = utools.db.getAttachmentType(key)
    if (buf && type) {
      // 创建Blob对象  
      const blob = new Blob([buf], { type: type })
      // 创建URL  
      const url = URL.createObjectURL(blob)
      return url
    }
    return ''
  }

  removeFile(key) {
    utools.db.remove(key)
  }
}

export default isUTools() ? new UToolsStorage() : new BrowserStorage()