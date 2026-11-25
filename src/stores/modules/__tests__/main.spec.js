import { beforeEach, describe, expect, it } from "vitest"
import useMainStore from "../main"
import { setActivePinia, createPinia } from 'pinia'

describe("useMainStore", () => {
    let store
    beforeEach(() => {
        setActivePinia(createPinia())
        store = useMainStore()
        store.init(1715308111014)
    })

    it('should have expected actions', () => {
        //parent
        let expectData = { id: 1719221025935, content: '555-ldld' }
        expect(store.getNodeByNameOrId(expectData).level).toBe(1)
        expect(store.getNodeByNameOrId(expectData).children.length).toBe(0)

        //child
        let expectData2 = { id: 1719220815002, content: '555-订单' }
        expect(store.getNodeByNameOrId(expectData).level).toBe(2)
        expect(store.getNodeByNameOrId(expectData).children.length).toBeGreaterThan(0)


    })
})