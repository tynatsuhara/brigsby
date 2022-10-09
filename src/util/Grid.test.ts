import { describe, expect, test } from "@jest/globals"
import { pt } from "../Point"
import { Grid } from "./Grid"

describe("grid", () => {
    test("set and get", async () => {
        const grid = new Grid<string>()
        expect(grid.entries()).toHaveLength(0)

        grid.set(pt(1, 2), "value")
        expect(grid.entries()).toHaveLength(1)
        expect(grid.get(pt(1, 2))).toEqual("value")

        grid.set(pt(1, 2), "different value")
        expect(grid.entries()).toHaveLength(1)
        expect(grid.get(pt(1, 2))).toEqual("different value")

        grid.set(pt(2, 2), "another value")
        expect(grid.entries()).toHaveLength(2)
    })

    test("removing at a specific point", async () => {
        const grid = new Grid<string>()
        grid.set(pt(1, 2), "value")
        grid.set(pt(2, 2), "different value")
        grid.remove(pt(2, 2))
        expect(grid.entries()).toHaveLength(1)
        expect(grid.get(pt(1, 2))).toEqual("value")
    })

    test("removing by value", async () => {
        const grid = new Grid<string>()
        grid.set(pt(1, 2), "value")
        grid.set(pt(2, 2), "value to remove")
        grid.set(pt(2, 3), "value to remove")
        grid.removeAll("value to remove")
        expect(grid.entries()).toHaveLength(1)
        expect(grid.get(pt(1, 2))).toEqual("value")
    })

    test("clear", async () => {
        const grid = new Grid<string>()
        grid.set(pt(1, 2), "value 1")
        grid.set(pt(2, 2), "value 2")
        grid.clear()
        expect(grid.entries()).toHaveLength(0)
    })

    test("map", async () => {
        const grid = new Grid<number>()
        grid.set(pt(1, 2), 2)
        grid.set(pt(2, 2), 3)
        const mappedGrid = grid.map((val) => val * 2)
        expect(mappedGrid.get(pt(1, 2))).toEqual(4)
        expect(mappedGrid.get(pt(2, 2))).toEqual(6)
    })

    test("filter", async () => {
        const grid = new Grid<number>()
        grid.set(pt(1, 2), 2)
        grid.set(pt(2, 2), 3)
        const filteredGrid = grid.filter((val) => val % 2 === 0)
        expect(filteredGrid.get(pt(1, 2))).toEqual(2)
        expect(filteredGrid.entries()).toHaveLength(1)
    })

    test("serialization", async () => {
        const originalGrid = new Grid<number>()
        originalGrid.set(pt(1, 2), 2)
        originalGrid.set(pt(-2, 2), 3)
        const serialized = originalGrid.serialize()
        const deserialized: Grid<number> = Grid.deserialize(serialized)
        expect(deserialized.get(pt(1, 2))).toEqual(2)
        expect(deserialized.get(pt(-2, 2))).toEqual(3)
    })

    test("values response should be unique", async () => {
        const grid = new Grid<number>()
        grid.set(pt(1, 2), 2)
        grid.set(pt(2, 2), 2)
        expect(grid.values().length).toEqual(1)
    })
})
