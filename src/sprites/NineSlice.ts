import { Point, pt } from "../Point"
import { Grid } from "../util"
import { SpriteComponent } from "./SpriteComponent"
import { SpriteSource } from "./SpriteSource"
import { SpriteTransform } from "./SpriteTransform"

export const NineSlice = {
    nineSliceForEach: (dimensions: Point, fn: (pt: Point, nineSliceIndex: number) => void) => {
        if (dimensions.x < 2 || dimensions.y < 2) {
            throw new Error("9 slice should be at least 2x2")
        }

        for (let x = 0; x < dimensions.x; x++) {
            for (let y = 0; y < dimensions.y; y++) {
                const getIndex = () => {
                    const edgeTop = y === 0
                    const edgeBottom = y === dimensions.y - 1
                    const edgeLeft = x === 0
                    const edgeRight = x === dimensions.x - 1
                    if (edgeLeft && edgeTop) {
                        return 0
                    } else if (edgeTop && !edgeRight) {
                        return 1
                    } else if (edgeTop) {
                        return 2
                    } else if (edgeLeft && !edgeBottom) {
                        return 3
                    } else if (!edgeTop && !edgeBottom && !edgeLeft && !edgeRight) {
                        return 4
                    } else if (edgeRight && !edgeBottom) {
                        return 5
                    } else if (edgeLeft && edgeBottom) {
                        return 6
                    } else if (edgeBottom && !edgeRight) {
                        return 7
                    } else {
                        return 8
                    }
                }

                fn(new Point(x, y), getIndex())
            }
        }
    },

    /**
     * @param slice the 9 parts to use to make a rectangle — suppliers, for easy facilitation of variants
     * @param dimensions dimensions of the desired rectangle in tile units
     * @param position top-left top-left position
     * @param depth depth of the sprites
     * @return The single transform and all the sprite components
     */
    makeNineSliceComponents: (
        slice: (() => SpriteSource)[],
        dimensions: Point,
        { position, depth }: { position?: Point; depth?: number } = {}
    ): { transform: SpriteTransform; sprites: Grid<SpriteComponent> } => {
        if (slice.length !== 9) {
            throw new Error("nine slice gotta have nine slices ya dip")
        }
        if (dimensions.x < 2 || dimensions.y < 2) {
            throw new Error("9 slice must be at least 2x2")
        }
        const sprites = new Grid<SpriteComponent>()
        const addSprite = (i: number, pt: Point) => {
            const transform =
                i === 0
                    ? SpriteTransform.new({ position: position.apply(Math.floor), depth })
                    : SpriteTransform.new({ position: pt })
            sprites.set(pt, slice[i]().toComponent(transform))
        }
        addSprite(0, pt(0, 0))
        addSprite(2, pt(dimensions.x - 1, 0))
        addSprite(6, pt(0, dimensions.y - 1))
        addSprite(8, pt(dimensions.x - 1, dimensions.y - 1))
        // horizontal lines
        for (let i = 1; i < dimensions.x - 1; i++) {
            addSprite(1, pt(i, 0))
            addSprite(7, pt(i, dimensions.y - 1))
        }
        // vertical lines
        for (let j = 1; j < dimensions.y - 1; j++) {
            addSprite(3, pt(0, j))
            addSprite(5, pt(dimensions.x - 1, j))
        }
        // middle
        for (let x = 1; x < dimensions.x - 1; x++) {
            for (let y = 1; y < dimensions.y - 1; y++) {
                addSprite(4, pt(x, y))
            }
        }

        const transform = sprites.get(Point.ZERO).transform
        sprites.values().forEach((c, i) => {
            c.transform.position = c.transform.position.times(transform.dimensions.x)
            if (i > 0) {
                c.transform.relativeTo(transform)
            }
        })
        transform.position = (position ?? Point.ZERO).apply(Math.floor)
        transform.depth = depth ?? transform.depth

        return { transform, sprites }
    },

    /**
     * Same as makeNineSliceComponents, but will stretch the middle parts instead of tiling.
     * This lets you make nine-slices whose dimensions aren't a multiple of the tile size.
     * @param slice the 9 parts to use to make a rectangle
     * @param dimensions dimensions of the desired rectangle in pixels. Should be at least TILE_SIZExTILE_SIZE
     * @param position top-left top-left position
     * @param depth depth of the sprites
     * @return The single transform and all the sprite components
     */
    makeStretchedNineSliceComponents: (
        slice: SpriteSource[],
        dimensions: Point,
        { position = Point.ZERO, depth = 0 }: { position?: Point; depth?: number } = {}
    ): { transform: SpriteTransform; sprites: SpriteComponent[] } => {
        if (slice.length !== 9) {
            throw new Error("nine slice gotta have nine slices ya dip")
        }
        // if (dimensions.x < 2 || dimensions.y < 2) {
        // throw new Error("9 slice must be at least 2x2")
        // }
        const sprites: SpriteComponent[] = []
        const topLeft = slice[0].toComponent(
            SpriteTransform.new({ position: position.apply(Math.floor), depth })
        )
        const tileSize = topLeft.transform.dimensions.x

        // corners
        sprites.push(topLeft)
        sprites.push(
            slice[2].toComponent(new SpriteTransform(new Point(dimensions.x - tileSize, 0)))
        )
        sprites.push(
            slice[6].toComponent(new SpriteTransform(new Point(0, dimensions.y - tileSize)))
        )
        sprites.push(
            slice[8].toComponent(
                new SpriteTransform(new Point(dimensions.x - tileSize, dimensions.y - tileSize))
            )
        )

        // horizontal lines
        const horizontalDimensions = new Point(dimensions.x - tileSize * 2, tileSize)
        sprites.push(
            slice[1].toComponent(new SpriteTransform(new Point(tileSize, 0), horizontalDimensions))
        )
        sprites.push(
            slice[7].toComponent(
                new SpriteTransform(
                    new Point(tileSize, dimensions.y - tileSize),
                    horizontalDimensions
                )
            )
        )

        // vertical lines
        const verticalDimensions = new Point(tileSize, dimensions.y - tileSize * 2)
        sprites.push(
            slice[3].toComponent(new SpriteTransform(new Point(0, tileSize), verticalDimensions))
        )
        sprites.push(
            slice[5].toComponent(
                new SpriteTransform(
                    new Point(dimensions.x - tileSize, tileSize),
                    verticalDimensions
                )
            )
        )

        // middle
        sprites.push(
            slice[4].toComponent(
                new SpriteTransform(
                    new Point(tileSize, tileSize),
                    new Point(dimensions.x - tileSize * 2, dimensions.y - tileSize * 2)
                )
            )
        )

        sprites.forEach((c, i) => {
            if (i > 0) {
                c.transform.relativeTo(topLeft.transform)
            }
        })

        return { transform: topLeft.transform, sprites }
    },
}
