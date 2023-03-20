import { computed } from 'vue'
import axios from '@/utils/axios'
import { store } from '@/store'
import { getFileSuffix, isImage, createManagementImageObject } from '@/utils'

const userConfigInfo = computed(() => store.getters.getUserConfigInfo).value

/**
 * 获取指定路径（path）下的目录列表
 * @param path 路径
 */
export const getDirListByPath = (path: string = '') => {
  return new Promise((resolve) => {
    axios
      .get(`/repos/${userConfigInfo.owner}/${userConfigInfo.selectedRepo}/contents/${path}`, {
        params: {
          ref: userConfigInfo.selectedBranch
        }
      })
      .then((res: any) => {
        if (res && res.status === 200 && res.data.length > 0) {
          resolve(
            res.data
              .filter((v: any) => v.type === 'dir')
              .map((x: any) => ({
                value: x.name,
                label: x.name
              }))
          )
        } else {
          resolve(null)
        }
      })
      .catch(() => {
        resolve(null)
      })
  })
}

/**
 * 获取指定路径（path）下的目录和图片
 * @param path
 */
export const getContentByRepoPath = (path: string = '') => {
  return new Promise((resolve) => {
    axios
      .get(`/repos/${userConfigInfo.owner}/${userConfigInfo.selectedRepo}/contents/${path}`, {
        params: {
          ref: userConfigInfo.selectedBranch
        }
      })
      .then((res: any) => {
        if (res && res.status === 200 && res.data.length) {
          res.data
            .filter((v: any) => v.type === 'dir')
            .forEach((x: any) => store.dispatch('DIR_IMAGE_LIST_ADD_DIR', x.path))

          setTimeout(() => {
            res.data
              .filter((v: any) => v.type === 'file' && isImage(getFileSuffix(v.name)))
              .forEach((x: any) => {
                store.dispatch('DIR_IMAGE_LIST_ADD_IMAGE', createManagementImageObject(x, path))
              })
          }, 100)

          resolve(true)
        } else {
          resolve(null)
        }
      })
      .catch(() => {
        resolve(null)
      })
  })
}