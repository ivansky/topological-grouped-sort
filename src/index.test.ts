import { SortTreeNode, topologicalGroupedSort } from "./index";

function getValuesLayers(layers: Array<SortTreeNode<string>[]>): Array<string[]> {
    return layers.map(layer => layer.map(node => node.value));
}

describe('topologicalGroupedSort', () => {
    it('should sort and group nodes', () => {
        const a = new SortTreeNode('a');
        const b = new SortTreeNode('b', [a]);
        const c = new SortTreeNode('c', [a]);
        const d = new SortTreeNode('d', [b, c]);

        expect(getValuesLayers(topologicalGroupedSort([
            c,
            a,
            d,
            b
        ]))).toEqual([
          ['a'],
          ['c', 'b'],
          ['d']
        ])
    });

    it('should throw an exception for cycled deps', () => {
        const a = new SortTreeNode('a', []);
        const b = new SortTreeNode('b', [a]);
        const c = new SortTreeNode('c', [b]);

        a.deps.push(c);
        a.__degree++;

        function run() {
            topologicalGroupedSort([
                c,
                a,
                b
            ]);
        }
        expect(run).toThrow();
    });
});
