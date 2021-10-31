
export class SortTreeNode<T> {
    __degree = 0;
    __dependants: SortTreeNode<T>[] = [];

    constructor(public value: T, public deps: SortTreeNode<T>[] = []) {
        deps.forEach(dep => this.withDep(dep));
    }

    withDep(dep: SortTreeNode<T>) {
        dep.__dependants.push(this);
        this.__degree++;
        return this;
    }
}

export class CycleDepsError<T> extends Error {
    constructor(lefts: SortTreeNode<T>[]) {
        const first = lefts[0];
        const visited = [first];
        const cycled: Array<SortTreeNode<T>[]> = [];

        function visit(node, paths: Array<SortTreeNode<T>[]>) {
            node.__dependants.forEach(next => {
                const nextPaths = paths.map(
                  path => path.slice(0).concat([next])
                );

                if (visited.includes(next)) {
                    cycled.push(...nextPaths);
                    return;
                }

                visit(next, nextPaths);
            });
        }

        visit(first, [[first]]);

        super('Cycled paths: \n' + cycled.map(path => path.map(item => item.value).join('->')).join(';\n'));
    }
}

export function topologicalGroupedSort<T>(nodes: SortTreeNode<T>[]): Array<SortTreeNode<T>[]> {
    if (!nodes.length) return [];

    let round: SortTreeNode<T>[] = [...nodes];
    let nextRound: SortTreeNode<T>[] = [];
    const sorted: Array<SortTreeNode<T>[]> = [];
    let roundIndex = 0;

    while (nextRound.length || round.length) {
        const roundSorted = [];

        while (round.length) {
            const node = round.shift();
            if (node.__degree > 0) {
                nextRound.push(node);
                continue;
            }

            roundSorted.push(node);
        }

        if (!roundSorted.length) {
            throw new CycleDepsError(nextRound);
        }

        roundSorted.forEach(node => {
            node.__dependants.forEach(dependant => dependant.__degree--);
        })

        sorted[roundIndex] = roundSorted;
        round = nextRound;
        nextRound = [];
        roundIndex++;
    }

    return sorted;
}
